const exec = require('child_process').exec;
const REG_KEY = '{4C5C32FF-BB9D-43B0-B5B4-2D72E54EAAA4}';
const REG_QUERY = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v ` + REG_KEY;
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_DIR = path.join(os.homedir(), 'Saved Games\\Frontier Developments\\Elite Dangerous');

function find_journals() {
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


module.exports = find_journals;



