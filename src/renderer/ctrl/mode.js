let MODE = {
    list: {
        cfg: 'config',
        nav: 'nav'
    },
    is_in: false,
    is_ready: false,
    c_mode: 'cfg',
    go: function (mode = null) {
        if (!this.is_in) this.is_in = true;
        if (mode) {
            this.c_mode = mode;
            localStorage.setItem('c_mode', this.modes.c_mode);
        } else {
            this.c_mode = 'cfg';
        }
    }
};

MODE.c_mode = (localStorage.getItem('c_mode')) || MODE.c_mode;

export default MODE;
