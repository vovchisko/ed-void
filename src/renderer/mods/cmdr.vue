<template>
    <div id="cmdr">
        <header>
            CMDR PROFILE
        </header>
        
        <pre>{{CMDR}}</pre>
    </div>
</template>

<script>
    import CMDR from '../ctrl/pilot';

    export default {
        name: 'cmdr',
        data: () => { return {CMDR: CMDR}},
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    #cmdr {
        h3 { margin-top: 1em; }
    }
</style>