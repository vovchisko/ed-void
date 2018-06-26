import {ipcRenderer} from 'electron';
import {EventEmitter} from 'eventemitter3';

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
}

const IPC = new IPC_Controller;

export default IPC;