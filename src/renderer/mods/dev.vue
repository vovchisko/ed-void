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
                <div class="col-sm">
                    <pre>MODE: {{MODE}}</pre>
                </div>
            </div>
        </div>

        <div class="container-fluid" v-if="c_tab === 'test'">
            <div class="ov ov-nav">ov-nav
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-top-line ov-solid">top-line
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-right-top">right-top
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-right ov-solid">right
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-left-top">left-top
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-left ov-solid">left
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-center ">center
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-center-long ov-interact">center-long
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot'
    import CFG from '../ctrl/cfg'
    import MODE from '../ctrl/mode';

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
                MODE: MODE,
                PILOT: PILOT,
                CFG: CFG,
            }
        },
        methods: {

        }
    }


</script>

<style lang="scss">

</style>