"use strict";


const extend = require('util')._extend;
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const util = require('util');
const WS = require('ws');
const ask = require('just-ask');
const exitHook = require('exit-hook');
const find_journals = require('./find_journals');
const c = {
    rst: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    grey: "\x1b[90m",

    bgblack: "\x1b[40m",
    bgred: "\x1b[41m",
    bggreen: "\x1b[42m",
    bgyellow: "\x1b[43m",
    bgblue: "\x1b[44m",
    bgmagenta: "\x1b[45m",
    bgcyan: "\x1b[46m",
    bgwhite: "\x1b[47m",
};

function parse_json(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }
}

const log = function () {
    process.stdout.write(c.white);
    console.log(...arguments, c.white);
};

function j_num(f) {
    let parts = path.basename(f).split('.');
    if (parts.length < 4) return null;
    return (parts[1] + '.' + parts[2]) * 1;
}

let SOFT_RESET = false;
let HARD_RESET = false;
let SERVICE_DOMAIN = 'ed-void.com';

let CFG_TYPE = '';
let last_arg = '';
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i].trim() === '-r') SOFT_RESET = true;
    if (process.argv[i].trim() === '-rx') HARD_RESET = true;
    if (last_arg.trim() === '-c') CFG_TYPE = process.argv[i].trim();
    if (last_arg.trim() === '-s') SERVICE_DOMAIN = process.argv[i].trim();
    last_arg = process.argv[i];
}


const APP_NAME = 'ed-void';
const APP_VERSION = '0.2b';
const SERVICE = `ws://${SERVICE_DOMAIN}:4202`;
const API_SERVICE = `http://${SERVICE_DOMAIN}/api`;

const data_files = ['Status.json', 'Market.json', 'ModulesInfo.json', 'Outfitting.json', 'Shipyard.json'];

fs.readFileAsync = util.promisify(fs.readFile);

class Journal {
    constructor() {
        this.status = {};
        this._curr_err = 0;
        this._stop = true;
        this.ws = null;
        this.watcher = null;
        this.files = [];
    }

    go(cfg) {
        this.cfg = cfg;

        exitHook(() => {
            log(`${c.rst}\ncya!`);
            this._stop = true;
            this.cfg.save();
            process.exit(0);
        });


        this.scan_all();

        log(`${c.grey}ED-ASS SETUP ... ${c.cyan}[ ${(CFG_TYPE || 'DEF').toUpperCase()} ]`);
        log(`${c.grey}JOURNAL:         ${c.rst}${this.cfg.journal_path}`);
        log(`${c.grey}CMDR:            ${c.rst}${this.cfg.cmdr}`);
        log(`${c.grey}SERVICE:         ${c.rst}${SERVICE_DOMAIN}`);

        this.timer = setInterval(() => {
            if (this._stop) return;
            this.force_important_files();
            this.do_some_work().catch((e) => { throw e; });
        }, 1000);

        try {
            this.watcher = fs.watch(this.cfg.journal_path, (ev, f) => {
                ev === 'change' ? this.file_check(f) : this.scan_all();
            });
        } catch (e) {
            return crash(`can't watch journal's directory!`);
        }

        this.connect();
    }

    connect() {

        log(`${c.grey}conection to ED-VOID...`);

        this.ws = new WS(SERVICE, 'edvoid', {});

        this.ws.on('open', () => {
            this.ws_send('auth', this.cfg.api_key);
        });

        this.ws.on('error', (e) => {
            this._curr_err++;
        });

        this.ws.on('close', (code, reason) => {
            this._stop = true;
            if (reason === 'unauthorized') {
                this.cfg.api_key = '';
                this.cfg.save();
                return this.cfg.get_ready();
            }


            log(`disconnected: [${c.red}${code}${c.rst}] ${c.white}${reason ? reason : 'ed-void connection error'}`);

            if (reason === 'other-client-connected') {
                return crash();
            }

            if (this._curr_err > 5) {
                return crash('ED-VOID service is unavailable.\nPlease try again later.');
            }

            if (!reason) setTimeout(() => { this.connect(); }, 1000);
        });

        this.ws.on('message', (msg) => {
            let m = parse_json(msg);
            if (!m) return this.track_fail({}, 'invalid message from server');
            if (m.c === 'welcome') {
                this._curr_err = 0;
                this._stop = false;
                log(`${c.white}ED-VOID${c.grey} :: ${c.green}READY!`);
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
                let jnum = j_num(f);
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

        let jnum = j_num(f);

        if (this.cfg.last_journal > j_num(f)) return;

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

                    //todo: is it another commander name? should we change it?

                    let rec = parse_json(lines[i]);

                    if(!rec) return this.track_fail({code: 'INVALID_JOURNAL_REC'}, 'hm.. this not supposed to happen');

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

                let l = `${c.grey}REC: ` +
                    `${c.cyan}[${this.cfg.cmdr}] ${c.grey}${records[0].timestamp} ` +
                    `${c.white}${records.length > 1 ? records.length : records[0].event}${c.grey} ...`;

                await this.record(records)
                    .then((res) => {
                        this.cfg.last_record = _last_rec;
                        this.cfg.last_journal = _last_jour;
                        this.cfg.save();
                        this._curr_err = 0;
                        log(`${l} ${c.green}[ ok ]${c.grey} ${res.data}`);
                    }).catch((e) => {
                        this.track_fail(e, 'in sending journal record');
                    });
            });
    }

    async read_data(f) {
        return await fs.readFileAsync(this.cfg.journal_path + '/' + f, 'utf8')
            .then(async (line) => {
                let rec = parse_json(line);
                if(!rec) return; // just ingnore empty json
                //only status send by WS
                if (f === 'Status.json')
                    return this.ws_send(rec.event, {
                        cmdr: this.cfg.cmdr,
                        rec: rec,
                        lng: this.cfg.language,
                        gv: this.cfg.gameversion,
                    });

                rec._data = f.split('.')[0].toLowerCase();

                let l = `${c.grey}REC: ` +
                    `${c.cyan}[${this.cfg.cmdr}] ${c.grey}${rec.timestamp} ` +
                    `${c.white}${rec.event}${c.grey} ...`;

                this.record([rec])
                    .then((res) => {
                        this._curr_err = 0;
                        log(`${l} ${c.green}[ ok ]${c.grey} ${res.data}`);
                    }).catch((e) => { this.track_fail(e, 'in sending status record') });
            }).catch((e) => {
                this.track_fail(e, 'in readding status');
            });
    }

    track_fail(e, sign = 'in unsigned location') {
        if (!this._curr_err)
            if (e.response) {
                if (!this._curr_err) log(`ERR:: Bad Response: ${c.white} [${e.response.status}] ${e.response.data} :: ${c.yellow}${sign}`);
            } else if (e.code) {
                log(`${c.red}ERR:: ${e.code}`, sign);
            } else {
                log(`${c.red}ERR:: unknown error`, sign);
            }
        this._curr_err++;
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

class Config {
    constructor(callback) {
        this._on_ready = callback;
        this._file = APP_NAME + (CFG_TYPE ? '-' + CFG_TYPE : '') + '.cfg';
        this.journal_path = '';
        this.api_key = '';
        this.cmdr = '';
        this.language = '';
        this.gameversion = '';
        this.last_journal = -1;
        this.last_record = -1;
        this.read();
    }

    async get_ready(again = false) {

        if (!this.api_key) {

            if (!again) {
                log(`\n\n${c.yellow}Oh, wait a sec. Your config file not filled yet. Let's fix it.`);
                log(`If you not registered on ${c.blue}http://${SERVICE_DOMAIN}/${c.white} yet`);
                log(`please do it now and come back when finish.\n`);
                log(`${c.cyan}Can you please login once?`);
            } else {
                log(`\n\n${c.cyan}Can you please login again?`);
            }

            let data = {email: '', pass: ''};

            await ask('EMAIL: ')
                .then((email) => {
                    data.email = email;
                    return ask('PASS: ', '*');
                })
                .then((pass) => {
                    data.pass = pass;
                    return axios.post(API_SERVICE + '/signin', data, {});
                })
                .then((result) => {
                    if (!result.data.result) {
                        log(`\nHm... weird. ${c.red}${result.data.text}`);
                        log(`Let's try again.`);
                        reject();
                    }
                    this.api_key = result.data.user.api_key;
                    log(`Cool. There is your API-Key: ${c.yellow}${this.api_key}`);
                    log(`I'll save it for you.`);
                    this.save();
                }).catch((e) => {
                    log(`${c.red}Ouch! Unable to login.`);
                    if (!data.email || !data.pass) return crash('login canceled.');
                    return this.get_ready(true); //again...
                });

        }

        if (!this.journal_path) {
            log(`\nNow let's try to find your journals...`);
            return await find_journals()
                .then(async (path) => {
                    log(`This is probably it...`);
                    log(`${c.yellow}${path}`);
                    this.journal_path = path;
                    log(`I'll save it too.`);
                    log(`Okay, Config file saved. I guess we ready to go.`);
                    log(`${c.grey}If you don't mind - first journal scan can take minute or two.`);
                    log(`${c.grey}Dependent how long you flying.`);
                    this.save();
                    const ask = require('just-ask')


                    return ask(`${c.magenta}\nPRESS ENTER TO START!\n`)
                        .then((r) => {
                            this._on_ready(this);
                        });


                })
                .catch((err) => {
                    log(`${c.red}Oh, snap!\n`, err.message);
                    log(`Unable to find journal path.`);
                    log(`Please open ${c.magenta}ed-void.cfg${c.white} with text editor and set ${c.bright}journal_path${c.white} correctly.`)
                    return crash();
                });
        }

        if (this.journal_path && this.api_key) {
            this._on_ready(this);
        } else {
            return crash('failed to start journal reader: no api-key or journal path');
        }
    }

    read() {
        let cfg = {};
        try {
            let lines = fs.readFileSync(this._file).toString().split('\n');
            for (let i = 0; i < lines.length; i++) {
                let de = lines[i].indexOf('=');
                let param = lines[i].substr(0, de);
                let val = lines[i].substr(de + 1, lines[i].length);
                if (param.trim())
                    cfg[param.trim()] = val.trim();
            }

            extend(this, cfg);
            if (!this.journal_path || !this.api_key) return this.get_ready();

            let files = fs.readdirSync(this.journal_path);
            if (!files.includes(data_files[0])) return this.get_ready();

            this._on_ready(this);

        } catch (e) {
            this.journal_path = '';
            this.get_ready();
            return false;
        }
        return true;
    }

    save() {
        let lines = [];
        for (let p in this) {
            if (p[0] !== '_')
                lines.push(p + ' = ' + this[p]);
        }
        fs.writeFileSync(this._file, lines.join('\n'));
    }
}

let CRASHED = false;
process.on('unhandledRejection', (reason, p) => { /* it happend because we already crashed ... i know it's ugly */ })

function crash(msg) {
    J._stop = true;
    if (msg) log('\n' + c.red + msg);
    if (CRASHED) return;
    CRASHED = true;
    ask('press enter to exit').then(() => {
        process.exit(0);
    });
}

const J = new Journal();
const CONFIG = new Config(function (CONFIG) {
    if (SOFT_RESET) { CONFIG.last_record = -1; }
    if (HARD_RESET) {
        CONFIG.last_record = -1;
        CONFIG.last_journal = -1;
    }
    J.go(this);
});


