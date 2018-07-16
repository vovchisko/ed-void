<template>
    <div id="app">
        <nav>
            <span class="drag" v-if="MODE.is_interact"><i class="i-menu"></i> ED VOID</span>
            <button v-if="MODE.is_ready && (MODE.is_interact || MODE.c_mode === m)" v-for="(m) in MODE.list" @click="MODE.go(m)" v-bind:class="MODE.c_mode === m ? 'semi-active' : ''">{{m}}</button>
        </nav>
        <alert></alert>

        <auth v-if="!MODE.is_in && !MODE.is_ready"></auth>
        <div v-if="MODE.is_ready && MODE.c_mode === 'log'">
            <small class="log">
                <div v-for="l in JLOG.log">{{l}}</div>
            </small>
        </div>
        <div v-if="MODE.is_ready && MODE.c_mode === 'dev'">
            <div class="row">
                <div class="col-sm">
                    <pre>MODE: {{MODE}}</pre>
                </div>
                <div class="col-sm">
                    <pre>CFG: {{CFG}}</pre>
                </div>
            </div>
        </div>
        <cfg v-if="MODE.is_ready && MODE.c_mode === 'cfg'"></cfg>


    </div>
</template>

<script>

    import {J, ISSH} from './ctrl/journal';
    import Auth from "./mods/auth";
    import Cfg from "./mods/cfg";
    import Alert, {A} from "./mods/alert";
    import MODE from './ctrl/mode';
    import IPC from './ctrl/ipc';
    import JLOG from './ctrl/jlog';
    import CFG from './ctrl/cfg';

    J.on('ready', (cfg) => {
        MODE.is_in = true;
        MODE.is_ready = true;
        MODE.go();
        A.release();
    });
    J.on('stop', (code, err) => {

        if (code === ISSH.NO_AUTH) {
            MODE.is_in = false;
            return;
        }

        if (code === ISSH.NET_SERVICE) {
            MODE.is_in = false;
            //return A.error({
            //    text: 'service unavailable, reconnecting...',
            //    desc: 'please, chek your internet connection or try again later',
            //    acts: {'try again': () => {J.go();}}
            //}, true);
            A.lock({
                text: 'service unavailable',
                desc: 'attempting to reconnect in 10 seconds',
                type: 'error'
            });

            setTimeout(() => {
                A.lock({
                    text: 'connecting to ed-void',
                    type: 'warn'
                });
                J.go();
            }, 10000);

        }

        if (code === ISSH.OTHER_CLIENT) {
            MODE.is_ready = false;
            return A.error({
                text: 'ed-void connection malfunction',
                desc: 'server registered another connection and terminated this session',
                acts: {'shutdown': () => {IPC.send('shutdown', ISSH.OTHER_CLIENT)}}
            })
        }

        if (code === ISSH.NO_JOURNALS) {
            return A.warn({
                text: 'Unable to locate journals!',
                desc: 'Void can`t automatically locate your journals. Specify path manually:',
                act: {'do something': () => {console.log('something!')}},
                prompt: {
                    'please, specify correct journal path': {
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

        MODE.is_ready = false;
        console.log('J-STOPPED', {code, err});
    });

    J.on('ws:any', (c, dat) => { console.log('J-WS-ANY:', c, dat); });

    // INITIALIZATION

    MODE.is_in = !!J.cfg.api_key;
    J.go();
    CFG.apply_ui_cfg();


    export default {
        components: {Alert, Auth, Cfg},
        mounted: function () {
            MODE.apply();
        },
        data: () => {
            return {MODE: MODE, JLOG: JLOG, CFG: CFG};
        },
        name: 'ed-void-client',
    }

</script>

<style lang="scss">
    @import '~bootstrap-css-only/css/bootstrap-reboot.min.css';
    @import '~bootstrap-css-only/css/bootstrap-grid.min.css';
    @import './styles/vars';
    @import './styles/base';
    @import './styles/look';
    nav {
        button { margin-right: 0.3em}
        .drag {
            -webkit-app-region: drag;
            line-height: 1.1em;
            padding-right: 2em;
            i { font-size: 1.3em; margin-right: 0.3em; }
        }
    }

</style>
