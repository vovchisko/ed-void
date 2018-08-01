<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>
        
        <div v-if="c_tab === 'stat'">
            <div class="row">
                <div class="col-sm">
                    <pre>PILOT.DEST: {{PILOT.dest}}</pre>
                </div>
                <div class="col-sm">
                    <pre>PILOT.CMDR: {{PILOT.cmdr}}</pre>
                </div>
                <div class="col-sm">
                    <pre>CFG: {{CFG}}</pre>
                </div>
            </div>
        </div>
        
        <div class="container-fluid" v-if="c_tab === 'test'">
            TEST
        </div>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot'
    import CFG from '../ctrl/cfg'

    const dev = {
        pipe: [],
        uni: [],
        log: [],
    };

    export default {
        name: "dev",
        components: {},
        data: () => {
            return {
                c_tab: 'test',
                tabs: ['test', 'stat'],
                PILOT: PILOT,
                CFG: CFG,
            }
        },
        methods: {}
    }

</script>

<style lang="scss">

</style>