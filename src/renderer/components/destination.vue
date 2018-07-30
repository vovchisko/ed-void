<template>
    <div class="loc-dest">
        <em v-if="PILOT.dest.sys_id"
            v-bind:class="PILOT.dest.sys_id === PILOT.cmdr.sys_id ? 'check' : 'uncheck'">
            <b>SYS</b><span>{{PILOT.dest.sys_id}}</span>
        </em>
        <em v-if="PILOT.dest.st_id"
            v-bind:class="PILOT.dest.st_id === PILOT.cmdr.st_id ? 'check' : 'uncheck'">
            <b>ST</b><span>{{PILOT.dest.st_id}}</span>
        </em>
        <em v-if="PILOT.dest.body_id"
            v-bind:class="PILOT.dest.body_id === PILOT.cmdr.body_id ? 'check' : 'uncheck'">
            <b>BODY</b><span>{{PILOT.dest.body_id}}</span>
        </em>
        <em v-if="PILOT.dest.min_alt !== null"
            v-bind:class="PILOT.status.alt !== null && PILOT.status.alt <= PILOT.dest.min_alt ? 'check' : 'uncheck'">
            <b>MIN.ALT</b><span>{{PILOT.dest.min_alt}} <u>m</u></span>
        </em>
        <em v-if="PILOT.dest.lat !== null && PILOT.dest.lon !== null"
            v-bind:class="PILOT.dest.dist !== null && PILOT.dest.dist <= 2 ? 'check' : 'uncheck'">
            <b>LAT</b><span>{{PILOT.dest.lat | nn(4,4)}} <u>°</u></span>
            <b>LON</b><span>{{PILOT.dest.lon | nn(4,4)}} <u>°</u></span>
        </em>
        
        <em class="no-dest">no destination set</em>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot'

    export default {
        name: "destination",
        data: () => { return {PILOT: PILOT}}
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    
    .loc-dest {
        h4 { margin-bottom: 0; }
        em { @include hcaps(); font-size: 1em}
        em > b { width: 30%}
        em > span { width: 70%; text-align: left }
        em.check { color: $green; }
    }
    
    .loc-dest em.no-dest {display: none; opacity: 0.5}
    .loc-dest em:first-child {display: block !important;}
</style>