<template>
    <div id="app">
        <div class="syntetic-header">
            <button v-on:click="toggle_window()"><i class="i-chevron-down"></i></button>
            <div class="header">ed-void</div>
        </div>
        <alert></alert>
        <auth v-if="!MODE.is_in && !A.busy.show && !A.stack.length"></auth>

        <navbar v-if="MODE.is_in && MODE.is_ready"></navbar>

        <div class="container-fluid" v-if="MODE.is_in && MODE.is_ready">
            <jlog v-if=" MODE.c_mode === 'log'"></jlog>
            <cmdr v-if=" MODE.c_mode === 'cmdr'"></cmdr>
            <edata v-if=" MODE.c_mode === 'edata'"></edata>
            <navi v-if=" MODE.c_mode === 'navi'"></navi>
            <run v-if="MODE.c_mode === 'run'"></run>
            <cfg v-if=" MODE.c_mode === 'cfg'"></cfg>
            <dev v-if=" MODE.c_mode === 'dev'"></dev>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";

    const {remote} = require('electron');


    import Alert, {A} from "./components/alert";

    import {J, ISSH} from './ctrl/journal';
    import Auth from "./mods/auth";
    import Cfg from "./mods/cfg";
    import Jlog from "./mods/jlog";
    import Edata from "./mods/edata";
    import Cmdr from "./mods/cmdr";
    import Navi from './mods/navi'
    import Run from './mods/run'
    import Dev from './mods/dev'

    import MODE from './ctrl/mode';
    import IPC from './ctrl/ipc';
    import JLOG from './ctrl/jlog';
    import CFG from './ctrl/cfg';
    import NET from './ctrl/net';
    import Navbar from "./mods/navbar";

    MODE.list.push('log', 'cmdr', 'run', 'edata', 'navi', 'cfg');

    export default {
        name: 'ed-void-client',
        components: {Navbar, Alert, Auth, Edata, Jlog, Cmdr, Cfg, Navi, Run, Dev},
        mounted: function () {
            IPC.apply_to_mode();
        },
        data: () => {
            return {MODE: MODE, JLOG: JLOG, CFG: CFG, A: A};
        },
        methods: {
            toggle_window() {
                remote.BrowserWindow.getFocusedWindow().minimize();
            }
        }
    }


    NET.on('uni:overload', (is_overload) => {
        if (is_overload) {
            A.lock({
                type: 'info progress',
                text: 'processing new data',
                desc: 'plase wait...',
            });
        } else {
            A.release();
        }
    });

    Vue.filter('nn', function (num, frac = 3, min_frac = 0, err = 'ERR!') {
        num = parseFloat(num);
        if (isNaN(num) || typeof num !== "number") return err;
        return (new Intl.NumberFormat('en-US', {
            maximumFractionDigits: frac,
            minimumFractionDigits: min_frac
        })).format(num);
    });

    Vue.filter('timing', function (num) {
        num = parseInt(num);
        if (num && !isNaN(num) && typeof num === "number") {
            let t = new Date(num);
            return [
                ("00" + t.getUTCHours()).slice(-2), ' : ',
                ("00" + t.getUTCMinutes()).slice(-2), ' : ',
                ("00" + t.getUTCSeconds()).slice(-2), '.',
                ("000" + t.getUTCMilliseconds()).slice(-3)
            ].join('');
        } else { return '-- : -- : --.---'}
    });

    Vue.filter('yn', function (value) {
        if (typeof value !== "boolean") return value;
        return value ? 'TRUE' : 'FALSE';
    });

    Vue.filter('isval', function (value) {
        return value ? value : 'FALSE';
    });

    Vue.filter('date', function (value) {
        if (value) {
            return moment(String(value)).format('MM/DD/YYYY hh:mm')
        }
    });


    J.on('ready', (cfg) => {
        MODE.is_in = true;
        MODE.is_ready = true;
        MODE.go();
        A.release();
    });


    NET.on('uni:user', (user) => {
        if (user.dev && !MODE.list.includes('dev'))
            MODE.list.push('dev');
    });


    J.on('stop', (code, err) => {

        if (code === ISSH.NO_AUTH) {
            MODE.is_in = false;
            return;
        }

        if (code === ISSH.NET_SERVICE) {
            MODE.is_in = false;
            A.error({
                text: 'service unavailable',
                desc: 'connection to server refused',
                type: 'error',
                acts: {
                    'ary again': function () { J.go(); },
                    'shutdown': function () {IPC.send('shutdown', ISSH.OTHER_CLIENT)}
                }
            });
        }

        if (code === ISSH.OTHER_CLIENT) {
            MODE.is_ready = false;
            return A.error({
                text: 'ed-void connection malfunction',
                desc: 'server registered another connection and terminated this session',
                acts: {'shutdown': function () {IPC.send('shutdown', ISSH.OTHER_CLIENT)}}
            })
        }

        if (code === ISSH.NO_JOURNALS) {
            return A.warn({
                text: 'Unable to locate journals!',
                desc: 'Void can`t automatically locate your journals. Specify path manually:',
                prompt: {
                    'please, specify correct journal path': {
                        val: J.cfg.journal_path,
                        acts: {
                            'apply path': function (input) {

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

        if (code === ISSH.OTHER_CLIENT) {
            MODE.is_ready = false;
            return A.error({
                text: 'ed-void system malfunction',
                desc: 'code: [' + code + ']',
                acts: {'shutdown': () => {IPC.send('shutdown', ISSH.OTHER_CLIENT)}}
            })
        }
    });

    //J.on('ws:any', (c, dat) => { console.log('J-WS-ANY:', c, dat); });

    // INITIALIZATION

    J.go();
    MODE.is_in = !!J.cfg.api_key;
    CFG.apply_ui_cfg();


</script>

<style lang="scss">
    @import '~bootstrap-css-only/css/bootstrap-reboot.min.css';
    @import '~bootstrap-css-only/css/bootstrap-grid.min.css';
    @import '~@/assets/icomoon/style.css';
    @import './styles/vars';
    @import './styles/base';
    @import './styles/fonts';
    @import './styles/overlay';
    @import './styles/fx';
    nav {
        user-select: none;
        cursor: default;
        button { margin-right: 0.3em}
        .drag {
            line-height: 1.1em;
            padding-right: 2em;
            i { font-size: 1.3em; margin-right: 0.3em; }
        }
    }
    .syntetic-header {
        position: absolute;
        right: 0; top: 0;
        line-height: 2.2em;
        height: 2.2em;
        margin: 5px 10px 5px 0;
        width: 200px;
        z-index: 19999;
        -webkit-app-region: drag;
        .header {
            @include hcaps;
            line-height: 2.2em;
            padding: 0 1em;
            &:after {
                content: ''; position: absolute; left: 0; bottom: 0; width: 1em; height: 1em;
                border-color: $ui-fg; border-style: solid; border-width: 0 0 1px 1px; }
        }
        button { float: right; -webkit-app-region: no-drag; }
    }
    #app {
    }

</style>
