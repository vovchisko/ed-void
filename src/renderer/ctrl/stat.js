import {J, ISSH} from "./journal";

let STAT = {
    _log_limit: 16,
    log: [],
    flush: function () {

    },
    push: function (line) {
        this.log.push(line);
        if (this.log.length > this._log_limit) {
            this.log.splice(0, 1);
        }
    }
};

J.on('log', (args) => { STAT.push(...args);});

export default STAT;