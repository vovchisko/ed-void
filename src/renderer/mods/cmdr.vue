<template>
    <div id="cmdr">
        <header>
            CMDR PROFILE
        </header>
        <h1>CMDR {{PILOT.cmdr.name}}</h1>
        <div class="row">
            <div class="col-sm edfx">
                <curr-position></curr-position>
                <div class="distances">
                    <h5>distances</h5>
                    <em>
                        <b>SOL</b>
                        <star-dist :pos="PILOT.cmdr.starpos" dest="sol@0:0:0"></star-dist>
                    </em>
                    <em>
                        <b>COLONIA</b>
                        <star-dist :pos="PILOT.cmdr.starpos" dest="colonia@-304976:-29129:633860"></star-dist>
                    </em>
                    <em>
                        <b>SAGGITARIUS *</b>
                        <star-dist :pos="PILOT.cmdr.starpos" dest="sagittarius a*@807:-669:828799"></star-dist>
                    </em>
                
                </div>
            </div>
            <div class="col-sm edfx">
                <div class="void-run-stats">
                    <h5>racing stats</h5>
                    <em><b>WIN</b><span>{{PILOT.cmdr.void_run.win}}</span></em>
                    <em><b>TOTAL</b><span>{{PILOT.cmdr.void_run.total}}</span></em>
                    <em><b>AVG</b><span>{{PILOT.cmdr.void_run.win / PILOT.cmdr.void_run.total}}</span></em>
                    <em><b>SCORE</b><span>{{PILOT.cmdr.void_run.score}}</span></em>
                </div>
            </div>
        </div>
        <!--pre>{{PILOT}}</pre-->
    
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot';
    import StarPos from "../components/star-pos";
    import StarDist from "../components/star-dist";
    import CurrPosition from "../components/curr-position";

    export default {
        name: 'cmdr',
        components: {CurrPosition, StarPos, StarDist},
        data: () => { return {PILOT: PILOT}},
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    #cmdr {
        .distances {
            h4 {}
            padding-top: 0.5em;
            @include hcaps();
            em b { width: 30%}
            em span { width: 70%; color: $blue}
        }
        .void-run-stats {
            @include hcaps();
        }
    }
</style>