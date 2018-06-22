<template>
    <div id="app">
        <h3>Login!</h3>
        <input v-model="auth.email"><br>
        <input v-model="auth.pass"><br>
        <button v-on:click="go()">let's GO</button>
        <button v-on:click="do_auth()">let's login</button>

        <pre>{{auth}} <br>{{c_mod}}</pre>
    </div>
</template>

<script>

    import {J, ISSH} from './services/journal';

    J.on('log', (args) => { console.log('LOG: ', ...args);});
    J.on('ready', (cfg) => { console.log('J-READY', cfg) });
    J.on('stop', (reason, code, err) => {
        if (reason === ISSH.NO_AUTH) {
        }
        console.log('J-STOPPED', {reason, code, err});
    });
    J.on('ws', (c, dat) => { console.log('J-WS:', c, dat); });
    J.init();

    const app = {
        auth: {email: '', pass: ''},
        c_mod: 'auth'
    };

    export default {
        data: () => {
            return app;
        },
        name: 'ed-void-client',
        methods: {
            go: function () {
                J.go();
            },
            do_auth: function () {
                J.get_api_key(this.auth.email, this.auth.pass)
                    .then((r) => {
                        console.log('THEN: ', r);
                        J.go();
                    })
                    .catch((r) => {console.log('CATCH: ', r)})
            }
        }
    }

</script>

<style>
    /* CSS */
</style>
