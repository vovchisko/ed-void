<template>
  <div id="app">
    <pre>{{output}}</pre>

    <h3>Login!</h3>
    <input v-model="auth.email"><br>
    <input v-model="auth.pass"><br>
    <button v-on:click="do_auth()">let's login</button>
  </div>
</template>

<script>

    import {Data} from './services/data';
    import {IPC} from './services/ipc';

    export default {
        data: () => {return {output: Data.output, auth: {email: '', pass: ''}}},
        name: 'ed-void-client',
        methods: {
            do_auth: function () {
              IPC.send('desu', {pew:1})
            }
        }
    }

</script>

<style>
  /* CSS */
</style>
