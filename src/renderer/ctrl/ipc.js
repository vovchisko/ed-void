import {ipcRenderer} from 'electron';
import {EventEmitter} from 'eventemitter3';
import MODE from "./mode";

class IPC_Controller extends EventEmitter {
    constructor() {
        super();
        ipcRenderer.on('ipc', (sender, c, data) => {
            this.emit(c, data);
            console.log('IPC:', c, data)
        });
        this.send('ready', true)
    }

    send(c, data) {
        ipcRenderer.send('ipc', c, data);
    }

    apply_to_mode() {
        document.body.setAttribute('env', process.env.NODE_ENV);
        document.body.setAttribute('interact', MODE.is_interact ? 'on' : 'off');
        document.body.setAttribute('overlay', MODE.is_overlay ? 'on' : 'off');
    }
}

const IPC = new IPC_Controller;

export default IPC;

IPC.on('set:interact', (mode) => {
    MODE.is_interact = mode;
    IPC.apply_to_mode();
});
IPC.on('set:overlay', (mode) => {
    MODE.is_overlay = mode;
    IPC.apply_to_mode();
});
IPC.on('mode:next', () => { MODE.next(); });

MODE.version = process.env.npm_package_version;