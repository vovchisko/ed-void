"use strict";


const path = require('path');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const WS = require('ws');
const EE3 = require('eventemitter3');

fs.readFileAsync = util.promisify(fs.readFile);


function parse_json(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }
}

const log = function () {
    console.log(...arguments);
};

let SOFT_RESET = false;
let HARD_RESET = false;
let SERVICE_DOMAIN = 'ed-void.com';

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

const data_files = ['Status.json', 'Market.json', 'ModulesInfo.json', 'Outfitting.json', 'Shipyard.json'];


class Journal extends EE3 {

    constructor() {
        super();
        this.status = {};
        this._curr_err = 0;
        this._stop = true;
        this.ws = null;
        this.watcher = null;
        this.files = [];
    }

    go(cfg) {
        this.cfg = cfg;

        this.scan_all();

        this.timer = setInterval(() => {
            if (this._stop) return;
            this.force_important_files();
            this.do_some_work().catch((e) => { throw e; });
        }, 1000);

        try {
            this.watcher = fs.watch(this.cfg.journal_path, (ev, f) => { ev === 'change' ? this.file_check(f) : this.scan_all(); });
        } catch (e) {
            return crash(`can't watch journal's directory!`);
        }

        this.connect();
    }

    j_num(f) {
        let parts = path.basename(f).split('.');
        if (parts.length < 4) return null;
        return (parts[1] + '.' + parts[2]) * 1;
    }

    connect() {
        log(`conection to ED-VOID...`);
        this.ws = new WS(SERVICE, 'edvoid', {});
        this.ws.on('open', () => {
            this.ws_send('auth', this.cfg.api_key);
        });

        this.ws.on('error', (e) => { console.log('ws.error', e)});

        this.ws.on('close', (code, reason) => {
            this._stop = true;
            if (reason === 'unauthorized') {
                this.cfg.api_key = '';
                this.cfg.save();
                return this.cfg.get_ready();
            }

            log(`disconnected: [${code}] ${reason ? reason : 'ed-void connection error'}`);

            if (reason === 'other-client-connected') {
                return crash();
            }

            if (!reason) setTimeout(() => { this.connect(); }, 1000);
        });

        this.ws.on('message', (msg) => {
            let m = parse_json(msg);
            if (!m) return this.track_fail({}, 'invalid message from server');
            if (m.c === 'welcome') {
                this._stop = false;
                log(`ED-VOID :: READY!`);
            }
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
                // check for updates
                if (this.files[f].mtime !== stat.mtimeMs || this.files[f].size !== stat.size) {
                    this.files[f].mtime = stat.mtimeMs;
                    this.files[f].size = stat.size;
                    this.files[f].changed = true;
                }
            } else {
                let jnum = this.j_num(f);
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
        //last.changed = true;
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

    is_ignored_record(rec) {
        if (['Music', 'ReceiveText'].includes(rec.event)) return true;
        if (rec.event === 'SendText' && !rec.Message.startsWith('/void')) return true;
        //todo: do we need to ignore something else?
        return false;
    }

    async read_log(f) {

        let jnum = this.j_num(f);

        if (this.cfg.last_journal > this.j_num(f)) return;

        return await fs.readFileAsync(this.cfg.journal_path + '/' + f, 'utf8')
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

                    if (!rec) return this.track_fail({code: 'INVALID_JOURNAL_REC'}, 'hm.. this not supposed to happen');

                    _last_rec = i;
                    _last_jour = jnum;

                    if (this.is_ignored_record(rec)) continue;

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
                        this.cfg.save();
                        log(`${l}  [ ok ] ${res.data}`);
                    }).catch((e) => {
                        this.track_fail(e, 'in sending journal record');
                    });
            });
    }

    async read_data(f) {
        return await fs.readFileAsync(this.cfg.journal_path + '/' + f, 'utf8')
            .then(async (line) => {
                let rec = parse_json(line);
                if (!rec) return; // just ingnore empty json
                //only status send by WS
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
                    }).catch((e) => { this.track_fail(e, 'in sending status record') });
            }).catch((e) => {
                this.track_fail(e, 'in readding status');
            });
    }

    track_fail(e, sign = 'in unsigned location') {
        if (e.response) {
            log(`ERR:: Bad Response:  [${e.response.status}] ${e.response.data} :: ${sign}`);
        } else if (e.code) {
            log(`ERR:: ${e.code}`, sign);
        } else {
            log(`ERR:: unknown error`, sign);
        }
        return e;
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


process.on('unhandledRejection', (reason, p) => { console.log(reason, p) });

function crash(msg) {
    J._stop = true;
    if (msg) log('\n' + c.red + msg);
    process.exit(0);

}



