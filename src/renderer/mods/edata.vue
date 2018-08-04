<template>
    
    <div class="exp-data">
        <header>
            exploration data
        </header>
        
        <div class="row summary">
            <div class="col-sm edfx">
                <h2 class="main">
                    <span>estimated data value</span>
                    <b>{{exp.total | nn()}} <u>Cr</u></b>
                    <small>* discovery bonus not included</small>
                </h2>
            </div>
            <div class="col-sm edfx">
                <div class="counters justified">
                    <em><b>data collected in</b> <span>{{exp.sys_count}} <u>systems</u></span></em>
                    <em><b>stars</b> <span>{{exp.summ.s}}</span></em>
                    <em><b>planets</b> <span>{{exp.summ.p}}</span></em>
                    <em><b>clusters</b> <span>{{exp.summ.c}}</span></em>
                </div>
            </div>
        </div>
        
        <edata-here detailed="true"></edata-here>
        
        <div class="systems">
            <h4 class="edfx edfx-delay-3" v-if="exp.total">
                <button class="link" v-on:click="refresh_exp()"><i class="i-sync"></i> load full data log</button>
            </h4>
            <div class="sys edfx" v-for="s in exp.systems">
                <div class="row ">
                    <div class="col-sm">
                        <h5>{{s.name}}<br><span>{{s.val | nn()}} Cr</span></h5>
                    </div>
                    <div class="col-sm justified">
                        <em v-for="(b,k) in s.bodies"><b>{{s.name}} {{k}}</b><span>{{b.v | nn()}} <u>Cr</u></span></em>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot';
    import NET from '../ctrl/net';
    import EdataHere from "../components/edata-here";

    export default {
        name: "edata",
        components: {EdataHere},
        data: () => {
            return {
                exp: PILOT.exp,
                env: PILOT.env
            }
        },
        methods: {
            refresh_exp: function () {
                this.exp.systems.splice(0, this.exp.systems.length);
                NET.send('exp-refresh');
            }
        },
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    .exp-data {
        
        .summary {
            text-align: right;
            padding-top: 1em;
            h2 {
                margin: 0; padding: 0; font-size: 2em;
                span { display: block; font-size: 0.5em; letter-spacing: 0.05em; color: darken($ui-text, 20%); }
                b { color: $orange; padding: .4em 0 0.1em 0; display: block; }
                small { color: darken($ui-text, 30%); font-size: 0.4em;}
            }
            .counters em {
                &:first-child { padding-bottom: 0.1em; margin-bottom: 0.1em;}
                &:first-child, &:first-child b { font-weight: bold; }
                font-size: 1.1em; line-height: 1.2em;
                b { @include hcaps(); }
                span {@include hcaps(); color: lighten($ui-text, 15%);}
            }
            .col-md { background: $dark; padding-bottom: 1.5em; padding-top: 1.5em}
        }
        
        .systems {
            padding-top: 2em;
            .sys {
                margin: 0.6em 0 0 0; padding: 0.6em 0 0 0; border-top: 2px solid $dark;
                h5 { padding: 0; margin: 0;
                    span { color: darken($ui-text, 20%) }
                }
                em { line-height: 1.1em;
                    b { text-transform: uppercase; color: darken($ui-text, 10%); width: 70%; }
                    span {width: 30%;
                        u { color: darken($ui-text, 15%); }
                    }
                }
            }
        }
    }
</style>