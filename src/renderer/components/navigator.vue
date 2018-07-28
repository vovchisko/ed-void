<template>
    <div class="navigator">
        <div class="compass edfx" v-if="PILOT.dest.head !== null && PILOT.cmdr.body_id === PILOT.dest.body_id">
            <div class="current" v-bind:style="NAV.style_ruler">
                <b class="head"></b>
            </div>
            <div class="dest" v-if="PILOT.dest.head" v-bind:style="NAV.style_dest">
                <b class="head" v-bind:class="NAV.dest_align">{{PILOT.dest.head}}</b>
            </div>
        </div>

        <div class="container-fluid">
            <div class="row">
                <div class="col-sm loc-curr">
                    <h5>CURR. POSITION</h5>
                    <div>
                        <em v-if="PILOT.env.system"><b>SYSTEM</b><span>{{PILOT.env.system.name}}</span></em>
                        <em v-if="PILOT.env.body"><b>BODY</b><span>{{PILOT.env.body.name}}</span></em>
                        <em v-if="PILOT.env.station"><b>ST</b><span>{{PILOT.env.station.name}}</span></em>
                        <em v-if="!PILOT.env.station && !PILOT.env.body"><b>&nbsp;</b><span>deep space</span></em>
                        <em v-if="PILOT.status.lat !== null"><b>LAT</b><span>{{PILOT.status.lat | nn(4,4)}} <u>°</u></span></em>
                        <em v-if="PILOT.status.lon !== null"><b>LON</b><span>{{PILOT.status.lon | nn(4,4)}} <u>°</u></span></em>
                        <em v-if="PILOT.status.alt !== null"><b>ALT</b><span>{{PILOT.status.alt}} <u>M</u></span></em>
                        <em v-if="PILOT.dest.dist"> <b>DIST</b><span>{{PILOT.dest.dist | nn(3,3)}} <u>KM</u></span> </em>
                    </div>
                </div>
                <div class="col-sm loc-dest">
                    <h5>DESTINATION</h5>
                    <div>
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
                        <em v-if="PILOT.dest.min_dist"
                            v-bind:class="PILOT.dest.dist !== null && PILOT.dest.dist <= 2 ? 'check' : 'uncheck'">
                            <b>MIN.DIST</b><span>{{PILOT.dest.min_dist | nn(3,3)}} <u>Km</u></span>
                        </em>
                        <em class="no-dest">no destination set</em>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import PILOT from '../ctrl/pilot'
    import NET from '../ctrl/net'

    const NAV = {
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
    };

    export default {
        name: "navigator",
        data: () => {return {NAV: NAV, PILOT: PILOT}}
    }

    NET.on('uni:status', () => update_head());
    NET.on('uni:dest', () => update_head());

    function update_head() {
        let rw = window.innerWidth;
        let offset = (rw / 2) - PILOT.status.head * 4;
        NAV.style_ruler['background-position-x'] = offset + 'px';
        if (PILOT.dest.enabled) {
            if (isNaN(PILOT.dest.head)) {
                NAV.style_dest['background-position-x'] = '0px';
                NAV.dest_align = 'err';
            } else {
                NAV.style_dest['background-position-x'] = (rw / 2) - ((PILOT.status.head - PILOT.dest.head) * 4) + 'px';
                let alg = Math.abs(PILOT.dest.head - PILOT.status.head);
                if (alg <= 5) NAV.dest_align = 'alg0';
                if (alg > 10) NAV.dest_align = 'alg1';
                if (alg > 15) NAV.dest_align = 'alg2';
            }
        }
    }
</script>

<style lang="scss">
    @import "../styles/vars";
    .navigator {
        .compass { margin: 0; padding: 5px 0;
            .current {
                image-rendering: pixelated;
                position: relative;
                background: transparent url('../assets/nav-ruler.gif') 0 5px repeat-x;
                width: 100%; height: 42px;
                margin: 0;
                transition: all linear 1s;
                .head {position: absolute;left: 50%;margin: 0 0 0 -5px; width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #ff8800;display: block;}
            }
            .dest {
                image-rendering: pixelated;
                background: transparent url('../assets/nav-ruler-dest.gif') 0 0 repeat-x;
                width: 100%; height: 50px;
                position: relative;transition: all linear 500ms;

                .head {
                    transition: transform linear 0.5s;
                    width: 50px;
                    font-size: 17px;
                    display: block;
                    text-align: center;
                    border: 1px solid #555;
                    color: #555;
                    position: absolute;
                    left: 50%;;
                    margin: 11px 0 0 -25px;}

                .head:after {content: "";width: 0;height: 0;border-left: 8px solid transparent;border-right: 8px solid transparent;border-bottom: 8px solid #555;display: block;position: absolute;left: 50%;margin: 3px 0 0 -8px;top: -14px;}
                .head:before {content: "vector";
                    color: #676767;display: block;position: absolute;left: 50%;margin: 0 0 0 -100px;top: 21px;width: 200px;text-align: center;text-transform: uppercase;font-size: 15px;}
                .head.alg0 {border-color: #0098f9;color: #0098f9;}
                .head.alg0:after {border-bottom-color: #0098f9;top: -14px;}
                .head.alg0:before {content: '[ ok ]'; color: #0098f9; }
                .head.alg1 {border-color: #FF8800;color: #FF8800;}
                .head.alg1:after {border-bottom-color: #FF8800;top: -14px;}
                .head.alg1:before {content: 'missaligment'; color: #FF8800; }
                .head.alg2 {border-color: $red;color: $red;}
                .head.alg2:after {border-bottom-color: $red; top: -14px;}
                .head.alg2:before {content: 'wrong course vector!'; color: $red; }
                .head.err { animation: glitched_text 2.5s infinite; color: $red; border-color: $red; }
                .head.err:after { border-bottom-color: $red; }
                .head.err:before { content: 'destination data invalid'; color: $red }
            }
        }

        .loc-curr, .loc-dest {
            h4 { margin-bottom: 0; }
            em { @include hcaps(); font-size: 1em}
            em > b { width: 30%}
            em > span { width: 70%; text-align: left }
            em.check { color: $green; }
        }

        .loc-dest em.no-dest {display: none; opacity: 0.5}
        .loc-dest em:first-child {display: block !important;}
        small { color: darken($ui-text, 25%);}
    }
</style>