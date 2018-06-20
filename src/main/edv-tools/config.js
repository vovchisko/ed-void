const fs = require('fs');
const path = require('path');
const os = require('os');
const exec = require('child_process').exec;
const extend = require('deep-extend');

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

    async get_api_key(email, pass) {
        return new Promise((resolve, reject) => {

            let result = {code: 0, msg: 'unable to login', api_key: false, error: null};

            axios.post(API_SERVICE + '/signin', {email: email, pass: pass}, {})
                .then((res) => {

                    if (!res.data.result) {
                        result.msg = 'invalid response';
                        result.res = res;
                        reject(result);
                        return console.log('update_api_key > response: ', res);
                    }
                    this.api_key = res.data.user.api_key;
                    this.save();

                    result.code = 1;
                    result.msg = 'success';
                    result.api_key = this.api_key;
                })
                .catch((err) => {
                    result.error = err;
                    console.log('update_api_key > error:', result);
                    reject(result);
                });


        });

    }

    resolve_journal_path() {
        const REG_KEY = '{4C5C32FF-BB9D-43B0-B5B4-2D72E54EAAA4}';
        const REG_QUERY = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v ` + REG_KEY;
        const DEFAULT_DIR = path.join(os.homedir(), 'Saved Games\\Frontier Developments\\Elite Dangerous');

        return new Promise(async function (resolve, reject) {
            fs.readdir(DEFAULT_DIR, (err, result) => {
                if (result && result.includes('Status.json')) return resolve(DEFAULT_DIR);

                exec(REG_QUERY, function (err, stdout, stderr) {
                    if (err) reject(err);

                    stdout.split('\n').forEach((val) => {
                        if (val.includes(REG_KEY)) {
                            let ANOTHER_DAVE_DIR = path.join(
                                val.split('REG_EXPAND_SZ')[1].trim(), 'Frontier Developments\\Elite Dangerous');

                            fs.readdir(ANOTHER_DAVE_DIR, (err, result) => {
                                if (result && result.includes('Status.json')) return resolve(ANOTHER_DAVE_DIR);
                                return reject();
                            });
                        }
                    });
                });
            });
        });
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
            if (!files.includes('Status.json')) return this.get_ready();

            this._on_ready(this);

        } catch (e) {
            this.journal_path = '';
            return false;
        }
        return true;
    }

    save() {
        let lines = [];
        for (let p in this)
            if (p[0] !== '_')
                lines.push(p + ' = ' + this[p]);

        fs.writeFileSync(this._file, lines.join('\n'));
    }
}