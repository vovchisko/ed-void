import EventEmitter3 from 'eventemitter3'
import {J, ISSH} from './journal'

//
// this network module should act just the same as frontend-one,
// but all ws interactions should be go through Journal WS connection.
//

class Network extends EventEmitter3 {
    constructor() {
        super();
        J.on('ws:any', (c, dat) => {
            this.emit(c, dat);
        });
    }

    init(api_key) {
        //do nothing yet
    }

    api(method, data){

    }

}

const NET = new Network;

export default NET;