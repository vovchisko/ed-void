import CFG from './cfg'
import IPC from './ipc'

let MODE = {
    list: ['log', 'dev', 'cfg'],
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
    },
    next: function () {
        let next = 0;
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i+1] !== 'cfg' && this.list[i] === this.c_mode && this.list[i + 1] !== undefined) {
                next = i + 1;
                break;
            }
        }
        this.go(this.list[next]);
    },
    apply: function () {
        document.body.setAttribute('env', process.env.NODE_ENV);
        document.body.setAttribute('interact', this.is_interact ? 'on' : 'off');
        document.body.setAttribute('overlay', this.is_overlay ? 'on' : 'off');

    }
};

MODE.c_mode = CFG.c_mode;


IPC.on('set:interact', (mode) => {
    MODE.is_interact = mode;
    MODE.apply();
});
IPC.on('set:overlay', (mode) => {
    MODE.is_overlay = mode;
    MODE.apply();
});
IPC.on('mode:next', () => { MODE.next(); });

export default MODE;
