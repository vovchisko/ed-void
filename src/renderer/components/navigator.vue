<template>
    <div class="navigator">
        <div class="compass edfx" ref="elm_compass" v-if="PILOT.dest.head !== null && PILOT.cmdr.body_id === PILOT.dest.body_id">
            <div class="current" v-bind:style="NAV.style_ruler">
                <b class="head"></b>
            </div>
            <div class="dest" v-if="PILOT.dest.head" v-bind:style="NAV.style_dest">
                <b class="head" v-bind:class="NAV.dest_align">{{PILOT.dest.head}}</b>
                
                <span class="dist" v-if="PILOT.dest.dist"
                      v-bind:class="PILOT.dest.dist !== null && PILOT.dest.dist <= PILOT.dest.min_dist">
                    <small>DISTANCE:</small>
                    {{PILOT.dest.dist | nn(3,3)}} KM
                    <small v-if="PILOT.dest.min_dist "> check: {{PILOT.dest.min_dist | nn(3,3)}} KM</small>
                </span>
            </div>
        </div>
        <div v-if="PILOT.dest.head === null || PILOT.cmdr.body_id !== PILOT.dest.body_id">
            <destination></destination>
        </div>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot'
    import NET from '../ctrl/net'
    import Destination from "./destination";

    const NAV = {
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
    };

    let $refs = null;

    export default {
        name: "navigator",
        components: {Destination},
        mounted: function () {
            $refs = this.$refs;
            update_head();
        },
        beforeDestroy: function () { $refs = null; },
        data: () => {return {NAV: NAV, PILOT: PILOT}}
    }

    NET.on('uni:status', () => update_head());
    NET.on('uni:dest', () => update_head());
    NET.on('uni:dest-set', () => update_head());

    function update_head() {
        if (!$refs || !$refs.elm_compass) return;
        let rw = $refs.elm_compass.clientWidth;
        console.log(rw);
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
                background: transparent url($asset_nav_ruler) 0 5px repeat-x;
                width: 100%; height: 42px;
                margin: 0;
                transition: all linear 1s;
                .head {position: absolute;left: 50%;margin: 0 0 0 -5px; width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #ff8800;display: block;}
            }
            .dest {
                image-rendering: pixelated;
                background: transparent url($asset_nav_ruler_dest) 0 0 repeat-x;
                width: 100%; height: 55px;
                position: relative;transition: all linear 500ms;
                
                .head {
                    transition: transform linear 0.5s;
                    width: 55px;
                    font-size: 18px;
                    display: block;
                    text-align: center;
                    border: 1px solid #555;
                    color: #555;
                    position: absolute;
                    left: 50%;;
                    margin: 14px 0 0 -25px;
                }
                
                .head:after {content: "";width: 0;height: 0;border-left: 8px solid transparent;border-right: 8px solid transparent;border-bottom: 8px solid #555;display: block;position: absolute;left: 50%;margin: 3px 0 0 -8px;top: -14px;}
                .head:before {content: "vector";
                    color: #676767;display: block;position: absolute;left: 50%;margin: 0 0 0 -100px;top: 21px;width: 200px;text-align: center;text-transform: uppercase;font-size: 15px;}
                .head.alg0 {border-color: #0098f9;color: #0098f9;}
                .head.alg0:after {border-bottom-color: #0098f9;top: -14px;}
                .head.alg0:before {content: '[ ok ]'; color: #0098f9; }
                .head.alg1 {border-color: #FF8800;color: #FF8800;}
                .head.alg1:after {border-bottom-color: #FF8800;top: -14px;}
                .head.alg1:before {content: 'misaligned'; color: #FF8800; }
                .head.alg2 {border-color: $red;color: $red;}
                .head.alg2:after {border-bottom-color: $red; top: -14px;}
                .head.alg2:before {content: 'wrong course vector!'; color: $red; }
                .head.err { animation: glitched_text 2.5s infinite; color: $red; border-color: $red; }
                .head.err:after { border-bottom-color: $red; }
                .head.err:before { content: 'destination data invalid'; color: $red }
                
                .dist {
                    @include hcaps();
                    position: absolute;
                    right: 0; bottom: 0;
                    font-size: 1.4em;
                    text-align: right;
                    small {display: block; font-size: 0.6em; line-height: 1 }
                    
                }
            }
        }
        
        small { color: darken($ui-text, 25%);}
    }
</style>