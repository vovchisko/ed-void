<template>
    <div id="app">
        <nav>
            <espan class="drag" v-if="mode.is_interact"><i class="i-menu"></i> ED VOID</espan>
            <button v-if="mode.is_interact || mode.c_mode === m" v-for="(m) in mode.list" @click="mode.go(m)" v-bind:class="mode.c_mode === m ? 'semi-active' : ''">{{m}}</button>
        </nav>
        <alert></alert>


        <auth v-if="!mode.is_in && !mode.is_ready"></auth>
        <cfg v-if="mode.is_ready && mode.c_mode === 'cfg'"></cfg>

        <small class="log">
            <div v-for="l in log">{{l}}</div>
        </small>
    </div>
</template>

<script>

    import {J, ISSH} from './ctrl/journal';
    import Auth from "./mods/auth";
    import Cfg from "./mods/cfg";
    import Alert, {A} from "./mods/alert";
    import MODE from './ctrl/mode';
    import IPC from './ctrl/ipc';
    import STAT from './ctrl/stat';
    import CFG from './ctrl/cfg';

    J.on('ready', (cfg) => {
        MODE.is_in = true;
        MODE.is_ready = true;
        MODE.go();
    });
    J.on('stop', (code, err) => {

        if (code === ISSH.NO_AUTH) {
            MODE.is_in = false;
            return;
        }

        if (code === ISSH.NET_SERVICE) {
            MODE.is_in = false;
            return A.error({
                text: 'ED-Void service unavailable',
                desc: 'please, chek your internet connection or try again later',
                acts: {'try again': () => {J.go();}}
            }, true);
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
            return {mode: MODE, log: STAT.log};
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
    body { perspective: 55em;}
    .log {
        position: absolute;
        right: 7em;
        top: 16em;
        transform: rotate3d(0, 1, 0.1, -19deg);
        color: #ff8800;
        text-shadow: -3px 4px rgba(0, 0, 0, 0.5);
    }
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
