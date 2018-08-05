<template>
    <div>
        <header>system log</header>
        <div class="jlog ov ov-left">
            <p>LOG :: CMDR {{PILOT.cmdr.name}}</p>
            <transition-group name="slide-fade">
                <div v-for="(l, i) in JLOG.log" :key="l">
                    {{l}}
                </div>
            </transition-group>
            <transition name="slide-fade">
                <div v-if="JLOG.log.length === 0">status: sleep</div>
            </transition>
        </div>

    </div>
</template>

<script>
    import JLOG from '../ctrl/jlog';
    import PILOT from '../ctrl/pilot'

    export default {
        name: "jlog",
        data: () => { return {PILOT: PILOT, JLOG: JLOG}}
    }
</script>

<style lang="scss">
    @import "../styles/vars";
    .jlog {
        padding: 1em 0;
        div { font-size: 0.8em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis}
        p { @include hcaps(); font-size: 0.9em; padding: 0; margin: 0; }

        .slide-fade-enter-active {
            transition: all .3s ease;
        }
        .slide-fade-leave-active {
            transition: all .8s linear;
        }
        .slide-fade-enter, .slide-fade-leave-to {
            transform: translateY(-5px);
            opacity: 0;
            line-height: 0em;
        }

    }

</style>