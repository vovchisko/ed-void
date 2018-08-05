import {J, ISSH} from "./journal";

let JLOG = {
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

setInterval(()=>{
    JLOG.log.splice(0, 1);
},2000);

J.on('log', (args) => { JLOG.push(...args);});

export default JLOG;
