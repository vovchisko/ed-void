<template>
    <div>
        <header>system log</header>
        <div class="jlog overlay-right">
            <div v-for="l in JLOG.log">{{l}}</div>
        </div>
    </div>
</template>

<script>
    import JLOG from '../ctrl/jlog';

    export default {
        name: "jlog",
        data: () => { return {JLOG: JLOG}}
    }
</script>

<style scoped>
    .jlog { padding: 1em 0; }
</style>