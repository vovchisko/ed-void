import CFG from './cfg'

let MODE = {
    list: [],
    is_in: false,
    is_ready: false,
    is_interact: true,
    is_overlay: false,
    c_mode: 'log',
    go: function (mode = null) {
        if (!this.is_in) this.is_in = true;
        if (mode) {
            this.c_mode = mode;
        } else {
            this.c_mode = 'log';
        }
        CFG.c_mode = this.c_mode;
        CFG.save();
    },
    next: function () {
        let next = 0;
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i + 1] !== 'cfg' && this.list[i] === this.c_mode && this.list[i + 1] !== undefined) {
                next = i + 1;
                break;
            }
        }
        this.go(this.list[next]);
    },

};

MODE.c_mode = CFG.c_mode;

export default MODE;