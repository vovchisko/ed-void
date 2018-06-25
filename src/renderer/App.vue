<template>
    <div id="app">
        <div v-if="modes.c_mode ==='loading'" class="loading">loading...</div>
        <auth v-if="modes.c_mode === 'auth'"></auth>
        <cfg v-if="modes.c_mode === 'cfg'"></cfg>
        <alert></alert>
    </div>
</template>

<script>

    import {J, ISSH} from './controllers/journal';
    import Data from './controllers/data';
    import Auth from "./components/auth";
    import Cfg from "./components/cfg";
    import Alert, {A} from "./components/alert";

    J.on('log', (args) => { console.log('LOG: ', ...args);});
    J.on('ready', (cfg) => {
        Data.modes.c_mode = 'cfg';
    });
    J.on('stop', (reason, code, err) => {
        console.log('J-STOPPED', {reason, code, err});
        if (reason === 'issue' && code === ISSH.NO_AUTH) {
            Data.modes.c_mode = 'auth';
            return;
        }
        if (reason === 'issue' && code === ISSH.NO_JOURNALS) {
            A.error({
                text: 'Unable to locate journals',
                desc: 'Void can`t automatically locate journals. Specify path manually:',
                act: {'do something': () => {console.log('something!')}},
                prompt: {
                    'set journal path': {
                        val: J.cfg.journal_path,
                        acts: {
                            'apply path': function (input) {
                                console.log('okay: ', input);
                                J.cfg.journal_path = input;
                                J.cfg.last_journal = -1;
                                J.cfg.last_record = -1;

                                J.cfg_save();
                                J.go();

                                return true;
                            },
                        }
                    }
                }
            }, true);
        }
    });
    J.on('ws:any', (c, dat) => { console.log('J-WS-ANY:', c, dat); });
    J.init();
    J.go();

    export default {
        components: {Alert, Auth, Cfg},
        data: () => {
            return {modes: Data.modes, A: A};
        },
        name: 'ed-void-client',
    }

</script>

<style lang="scss">
    @import '~bootstrap/dist/css/bootstrap-grid.css';
    @import './styles/vars';
    @import './styles/base';
</style>
