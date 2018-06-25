<template>
    <div id="app">
        <div v-if="modes.c_mode ==='loading'" class="loading">loading...</div>
        <auth v-if="modes.c_mode === 'auth'"></auth>
        <cfg v-if="modes.c_mode === 'cfg'"></cfg>
        <pre>{{modes}}</pre>
    </div>
</template>

<script>

    import {J, ISSH} from './services/journal';
    import Data from './services/data';
    import Auth from "./components/auth";
    import Cfg from "./components/cfg";

    J.on('log', (args) => { console.log('LOG: ', ...args);});
    J.on('ready', (cfg) => {
        Data.modes.c_mode = 'cfg';
        console.log('ready? really?')
    });
    J.on('stop', (reason, code, err) => {
        console.log('J-STOPPED', {reason, code, err});
        if (reason === 'issue' && code === ISSH.NO_AUTH) {
            Data.modes.c_mode = 'auth';
            return;
        }
    });
    J.on('ws:any', (c, dat) => { console.log('J-WS-ANY:', c, dat); });
    J.init();
    J.go();

    const app = {
        modes: Data.modes,
    };

    export default {
        components: {Auth, Cfg},
        data: () => {
            return app;
        },
        name: 'ed-void-client',
    }

</script>

<style lang="scss">
    @import './styles/vars';
    @import './styles/base';
</style>
