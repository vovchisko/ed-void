const exec = require('child_process').exec;
const EPIC_LINE = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v `;
const EPIC_KEY = '{4C5C32FF-BB9D-43B0-B5B4-2D72E54EAAA4}';
const fs = require('fs');
const path = require('path');

function find_journals() {
    return new Promise(function (resolve, reject) {
        exec(EPIC_LINE + EPIC_KEY, function (err, stdout, stderr) {
            if (err) reject(err);
            stdout.split('\n').forEach((val) => {
                if (val.includes(EPIC_KEY)) {
                    let here = val.split('REG_EXPAND_SZ')[1].trim();
                    here = path.resolve(here + '\\Frontier Developments\\Elite Dangerous');
                    fs.readdir(here, (err, list) => {
                        if (err) return reject(err);
                        return resolve(here);
                    });
                }
            });
        });
    });
}


module.exports = find_journals;