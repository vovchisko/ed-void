import CFG from './cfg'

let MODE = {
    list: {
        cfg: 'config',
    },
    is_in: false,
    is_ready: false,
    is_interact: true,
    is_overlay: true,
    c_mode: 'cfg',
    go: function (mode = null) {
        if (!this.is_in) this.is_in = true;
        if (mode) {
            this.c_mode = mode;
        } else {
            this.c_mode = 'cfg';
        }
        CFG.c_mode = this.c_mode;
    }
};

MODE.c_mode = CFG.c_mode;

export default MODE;
