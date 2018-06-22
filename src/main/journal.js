"use strict";


const path = require('path');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const WS = require('ws');
const EE3 = require('eventemitter3');
const os = require('os');
const exec = require('child_process').exec;
const extend = require('deep-extend');

const readFileAsync = util.promisify(fs.readFile);

const REG_KEY = '{4C5C32FF-BB9D-43B0-B5B4-2D72E54EAAA4}';
const REG_QUERY = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v ` + REG_KEY;
const DEFAULT_DIR = path.join(os.homedir(), 'Saved Games\\Frontier Developments\\Elite Dangerous');

const log = function () {
    console.log(...arguments);
};

let SOFT_RESET = false;
let HARD_RESET = false;
let SERVICE_DOMAIN = 'localhost';//'ed-void.com';

let last_arg = '';
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].trim() === '-r') SOFT_RESET = true;
    if (process.argv[i].trim() === '-rx') HARD_RESET = true;
    if (last_arg.trim() === '-s') SERVICE_DOMAIN = process.argv[i].trim();
    last_arg = process.argv[i];
}

const APP_NAME = 'ed-void';
const APP_VERSION = '0.3b';
const SERVICE = `ws://${SERVICE_DOMAIN}:4202`;
const API_SERVICE = `http://${SERVICE_DOMAIN}/api`;
const CFG_FILE = APP_NAME + '.cfg';
const data_files = ['Status.json', 'Market.json', 'ModulesInfo.json', 'Outfitting.json', 'Shipyard.json'];

const ISSH = {
    NO_ISSUE: null,
    NO_AUTH: 'no-key',
    NO_JOURNALS: 'no-journals',
    ERROR: 'error',
    OTHER_CLIENT: 'other-client-connected',
    NET_SERVICE: 'service-unavailable',
};

export {Journal, ISSH};

class Journal extends EE3 {

    constructor() {
        super();

        this.cfg = {
            journal_path: '',
            api_key: '',
            cmdr: '',
            language: '',
            gameversion: '',
            last_journal: -1,
            last_record: -1,
        };

        this._stop = true;
        this.ws = null;
        this.watcher = null;
        this.files = [];

        this.cfg_read();
    }


    pre_check() {
        return new Promise(async (ready, reject) => {

            // AUTH CHECK
            if (!this.cfg.api_key) return reject(ISSH.NO_AUTH);

            // JOURNALS CHECK
            if (_check_journals(this.cfg.journal_path)) return ready();
            if (_check_journals(DEFAULT_DIR)) {
                this.cfg.journal_path = DEFAULT_DIR;
                return ready();
            }
            exec(REG_QUERY, function (err, stdout, stderr) {
                if (err) reject(ISSH.NO_JOURNALS, err);
                stdout.split('\n').forEach((val) => {
                    if (val.includes(REG_KEY)) {
                        let ANOTHER_DIR = path.join(val.split('REG_EXPAND_SZ')[1].trim(), 'Frontier Developments\\Elite Dangerous');
                        if (_check_journals(ANOTHER_DIR)) {
                            this.cfg.journal_path = ANOTHER_DIR;
                            return ready();
                        }
                        return reject(ISSH.NO_JOURNALS);
                    }
                });
            });

        });
    }


    go() {
        this.pre_check()
            .then(() => {
                this._stop = false;
                this.scan_all();
                this.timer = setInterval(() => {
                    if (this._stop) return;
                    this.force_important_files();
                    this.do_some_work().catch((e) => { this.stop('issue', ISSH.ERROR, e) });
                }, 1000);

                try {
                    this.watcher = fs.watch(this.cfg.journal_path, (ev, f) => {
                        ev === 'change' ? this.file_check(f) : this.scan_all();
                    });
                } catch (e) {
                    return this.stop('issue', ISSH.ERROR, e);
                }
                this.connect();
            })
            .catch((issue, err) => {
                this.stop('issue', issue, err);
            })
    }

    stop(reason = null, code, err) {
        try {
            this._stop = true;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            if (this.watcher) {
                this.watcher.close();
                this.watcher = null;
            }
        } catch (e) {
            console.log('OH SHI!', e)
            process.exit(-1);
        }
        if (!reason) {
            this.cfg_save();
            //process.exit(0);
        } else {
            this.emit('stop', reason, code, err);
        }
    }


    cfg_read() {
        let cfg = {};
        try {
            let lines = fs.readFileSync(CFG_FILE).toString().split('\n');

            for (let i = 0; i < lines.length; i++) {
                let de = lines[i].indexOf('=');
                let param = lines[i].substr(0, de);
                let val = lines[i].substr(de + 1, lines[i].length);
                if (param.trim()) cfg[param.trim()] = val.trim();
            }

            extend(this.cfg, cfg);

        } catch (e) {
            this.stop('issue', ISSH.ERROR, e);
        }
    }

    cfg_save() {
        let lines = [];
        for (let p in this.cfg)
            if (p[0] !== '_')
                lines.push(p + ' = ' + this.cfg[p]);

        fs.writeFileSync(CFG_FILE, lines.join('\n'));
    }

    async get_api_key(email, pass) {
        return new Promise((resolve, reject) => {
            let result = {code: 0, msg: 'unable to login', api_key: false, error: null};
            axios.post(API_SERVICE + '/signin', {email: email, pass: pass}, {})
                .then((res) => {
                    if (!res.data.result) return reject(result);
                    this.cfg.api_key = res.data.user.api_key;
                    this.cfg_save();
                    result.code = 1;
                    result.msg = 'new api-key saved';
                    result.api_key = this.cfg.api_key;
                    return resolve(result);
                })
                .catch((err) => {
                    result.msg = 'update_api_key > error';
                    result.error = err;
                    reject(result);
                });
        });
    }

    connect() {
        log(`conection to ED-VOID...`);
        this.ws = new WS(SERVICE, 'edvoid', {});
        this.ws.on('open', () => {
            this.ws_send('auth', this.cfg.api_key);
        });

        this.ws.on('error', (e) => { console.log('ws.error', e)});

        this.ws.on('close', (code, reason) => {

            let ish = ISSH.NO_ISSUE;

            if (reason === 'unauthorized') {
                this.cfg.api_key = '';
                this.cfg_save();
                ish = ISSH.NO_AUTH;
            }

            if (reason === 'other-client-connected') {
                ish = ISSH.OTHER_CLIENT;
            }

            return this.stop('issue', ish, {code, reason});

        });

        this.ws.on('message', (msg) => {
            let m = parse_json(msg);
            if (!m) this.stop(ISSH.ERROR, 'err-server-message-parse');
            if (m.c === 'welcome') {
                this._stop = false;
            }
            this.emit('ws', msg.c, msg.data)
        });
    }

    ws_send(c, dat) {
        if (this.ws.readyState === WS.OPEN) {
            this.ws.send(JSON.stringify({c: c, dat: dat}));
        }
    }

    scan_all() {
        let files = fs.readdirSync(this.cfg.journal_path);
        if (!files) return crash('can`t read journal`s directory!\n');
        for (let f in this.files) if (!files.includes(f)) delete this.files[f];
        for (let i = 0; i < files.length; i++) this.file_check(files[i]);
    }

    file_check(f) {
        if (!data_files.includes(f) && !f.includes('Journal.')) return;
        if (f.includes(APP_NAME)) return;
        fs.stat(this.cfg.journal_path + '/' + f, (err, stat) => {
            if (err) return log(err);
            if (this.files[f]) {
                if (this.files[f].mtime !== stat.mtimeMs || this.files[f].size !== stat.size) {
                    this.files[f].mtime = stat.mtimeMs;
                    this.files[f].size = stat.size;
                    this.files[f].changed = true;
                }
            } else {
                let jnum = _jnum(f);
                this.files[f] = {
                    f: f,
                    jnum: jnum,
                    mtime: stat.mtimeMs,
                    size: stat.size,
                    proceed: 0,
                    changed: true,
                };
            }
            return this.files[f];
        });
    }

    get_last_journal() {
        let f = null;
        for (let i in this.files)
            if (this.files[i].jnum && (!f || this.files[i].jnum > f.jnum)) f = this.files[i];
        return f;
    }

    force_important_files() {
        let last = this.get_last_journal();
        this.file_check('Status.json');
        if (last) this.file_check(last.f);
    }


    async do_some_work() {
        if (this.working || this._stop) return;
        this.working = true;
        for (let f in this.files) {
            if (!this.files[f].changed) continue;
            if (data_files.includes(f)) {
                await this.read_data(f)
                    .then(() => {
                        this.files[f].changed = false;
                    })
                    .catch((e) => {
                        if (e.code && e.code === 'ENOENT') crash('Unable to read journal file: ' + f);
                        this.files[f].changed = true;
                    });
            } else {
                await this.read_log(f)
                    .then(() => {
                        this.files[f].changed = false;
                    })
                    .catch((e) => {
                        if (e.code && e.code === 'ENOENT') crash('Unable to read journal file: ' + f);
                        this.files[f].changed = true;
                    });
            }
        }
        this.working = false;
    }


    async read_log(f) {

        let jnum = _jnum(f);

        if (this.cfg.last_journal > _jnum(f)) return;

        return await readFileAsync(this.cfg.journal_path + '/' + f, 'utf8')
            .then(async (data) => {

                let lines = data.toString().split("\n");
                let records = [];

                let _last_jour = this.cfg.last_journal;
                let _last_rec = this.cfg.last_record;
                if (jnum > _last_jour) {
                    _last_jour = jnum;
                    _last_rec = -1;
                }

                for (let i = 0; i < lines.length; i++) {

                    if (!lines[i]) continue;
                    if (!this.is_new_rec(jnum, i)) continue;

                    let rec = parse_json(lines[i]);

                    if (!rec) return log('unable to parse record.');

                    _last_rec = i;
                    _last_jour = jnum;

                    if (_is_ignored_record(rec)) continue;

                    if (rec.event === 'NewCommander') {this.cfg.cmdr = rec.Name;}
                    if (rec.event === 'Commander') {this.cfg.cmdr = rec.Name;}
                    if (rec.event === 'LoadGame') {this.cfg.cmdr = rec.Commander;}
                    if (rec.event === 'Fileheader') {
                        this.cfg.language = rec.language;
                        this.cfg.gameversion = rec.gameversion;
                    }

                    //we need it to reproduce journal flow
                    rec._jp = _last_jour;
                    rec._jl = _last_rec;

                    records.push(rec);
                }

                if (records.length < 1) return;

                let l = `REC: ` +
                    `[${this.cfg.cmdr}] ${records[0].timestamp} ` +
                    `${records.length > 1 ? records.length : records[0].event} ...`;

                await this.record(records)
                    .then((res) => {
                        this.cfg.last_record = _last_rec;
                        this.cfg.last_journal = _last_jour;
                        this.cfg_save();
                        log(`${l}  [ ok ] ${res.data}`);
                    }).catch((e) => {
                        log('error in sending journal record', e);
                    });
            });
    }

    async read_data(f) {
        return await readFileAsync(this.cfg.journal_path + '/' + f, 'utf8')
            .then(async (line) => {
                let rec = parse_json(line);
                if (!rec) return;

                if (f === 'Status.json')
                    return this.ws_send(rec.event, {
                        cmdr: this.cfg.cmdr,
                        rec: rec,
                        lng: this.cfg.language,
                        gv: this.cfg.gameversion,
                    });

                rec._data = f.split('.')[0].toLowerCase();

                let l = `REC: ` +
                    `[${this.cfg.cmdr}] ${rec.timestamp} ` +
                    `${rec.event} ...`;

                this.record([rec])
                    .then((res) => {
                        log(`${l} [ ok ] ${res.data}`);
                    }).catch((e) => { log('error in sending status record', e) });
            }).catch((e) => {
                log('error in readding status', e);
            });
    }

    record(records) {
        return axios.post(API_SERVICE + '/record', records, {
            headers: {
                api_key: this.cfg.api_key,
                client: APP_NAME + '/' + APP_VERSION,
                cmdr: this.cfg.cmdr,
                gv: this.cfg.gameversion,
                lng: this.cfg.language
            }
        });
    }

    is_new_rec(jnum, i) {
        let _last_jour = this.cfg.last_journal;
        let _last_rec = this.cfg.last_record;
        if (jnum > _last_jour)
            _last_rec = -1;
        return _last_rec < i;
    }
}

// HELPERS

function _is_ignored_record(rec) {
    if (['Music', 'ReceiveText'].includes(rec.event)) return true;
    if (rec.event === 'SendText' && !rec.Message.startsWith('/void')) return true;
    //todo: do we need to ignore something else?
    return false;
}

function _jnum(f) {
    let parts = path.basename(f).split('.');
    if (parts.length < 4) return null;
    return (parts[1] + '.' + parts[2]) * 1;
}

function _check_journals(path) {
    if (path) {
        let files = fs.readdirSync(path);
        if (!files.includes(data_files[0])) return false;
    }
    return true;
}

function parse_json(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }
}
