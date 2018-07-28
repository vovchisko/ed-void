import EventEmitter3 from 'eventemitter3'
import {J, ISSH} from './journal'
import VARS from '../ctrl/vars'
import CFG from '../ctrl/cfg'
import {A} from '../components/alert'
//
// this net module should act just the same as frontend-one,
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

    api(method, data, lock = null) {
        if (lock !== false) A.lock({text: VARS.API_PROCESSING_MSG[method] || 'please wait, processing'});
        return fetch('http://' + window.location.hostname + /*(location.port ? ':' + 4200 : '') +*/ '/api/' + method, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {api_key: CFG.api_key || 'none'}
        })
            .then((res) => {
                A.release();
                return res.json().then((obj) => {
                    // console.log(`API: ${method} :: `, obj);
                    return obj;
                });
            })
            .catch((e) => {
                A.release();
                console.log('API-ERR:: ', e);
                throw e
            });
    }

    send(c, dat) {
        J.ws_send(c,dat);
    };

}

const NET = new Network();

NET.on('uni:alert', (a) => A.add(a));

export default NET;