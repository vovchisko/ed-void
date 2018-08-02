<template>
    <div class="loc-curr">
        <h5>curr. position</h5>
    
        <em v-if="PILOT.env.system"><b>SYSTEM</b><span>{{PILOT.env.system.name}}</span></em>
        <em v-if="PILOT.env.body"><b>BODY</b><span>{{PILOT.env.body.name}}</span></em>
        <em v-if="PILOT.env.station"><b>ST</b><span>{{PILOT.env.station.name}}</span></em>
        <em v-if="!PILOT.env.station && !PILOT.env.body"><b>&nbsp;</b><span>deep space</span></em>
        <em v-if="PILOT.status.lat !== null"><b>LAT</b><span>{{PILOT.status.lat | nn(4,4)}} <u>°</u></span></em>
        <em v-if="PILOT.status.lon !== null"><b>LON</b><span>{{PILOT.status.lon | nn(4,4)}} <u>°</u></span></em>
        <em v-if="PILOT.status.alt !== null"><b>ALT</b><span>{{PILOT.status.alt}} <u>M</u></span></em>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot'

    export default {
        name: "curr-position",
        data: () => { return {PILOT: PILOT}}
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    .loc-curr {
        h4 { margin-bottom: 0; }
        em { @include hcaps(); font-size: 1em}
        em > b { width: 30%}
        em > span { width: 70%; text-align: left }
        em.check { color: $green; }
    }
</style>