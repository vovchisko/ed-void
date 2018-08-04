<template>
    <div id="app">
        
        <alert></alert>
        <auth v-if="!MODE.is_in"></auth>
        
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

    MODE.list.push('log', 'cmdr', 'run', 'edata', 'navi',  'cfg');

    export default {
        components: {Navbar, Alert, Auth, Edata, Jlog, Cmdr, Cfg, Navi, Run, Dev},
        mounted: function () {
            IPC.apply_to_mode();
        },
        data: () => {
            return {MODE: MODE, JLOG: JLOG, CFG: CFG};
        },
        name: 'ed-void-client',
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
            A.lock({
                text: 'service unavailable',
                desc: 'attempting to reconnect. please wait',
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
    });

    //J.on('ws:any', (c, dat) => { console.log('J-WS-ANY:', c, dat); });

    // INITIALIZATION

    MODE.is_in = !!J.cfg.api_key;
    J.go();
    CFG.apply_ui_cfg();

</script>

<style lang="scss">
    @import '~bootstrap-css-only/css/bootstrap-reboot.min.css';
    @import '~bootstrap-css-only/css/bootstrap-grid.min.css';
    @import '~@/assets/icomoon/style.css';
    @import './styles/vars';
    @import './styles/base';
    @import './styles/fonts';
    @import './styles/fx';
    @import './styles/overlay';
    nav {
        user-select: none;
        cursor: default;
        button { margin-right: 0.3em}
        .drag {
            -webkit-app-region: drag;
            line-height: 1.1em;
            padding-right: 2em;
            i { font-size: 1.3em; margin-right: 0.3em; }
        }
    }

</style>
