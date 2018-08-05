<template>
    <div class="run">
        <header v-if="!PILOT.cmdr.run_id && state==='runs'">
            <button v-on:click="state='tracks'">host new run</button>
        </header>
        <header v-if="!PILOT.cmdr.run_id && state==='tracks'">
            <button class="link" v-on:click="state='runs'"><i class="i-chevron-left"></i> host new run</button>
        </header>
        <header v-if="PILOT.cmdr.run_id">
            <button v-on:click="leave_run()" v-if="R.run.status === 'setup'">leave setup</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'running'">abandon race</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'complete'">complete race</button>
        </header>

        <!-- TRACKS -->

        <div class="ov ov-main ov-interact" v-if="state==='tracks' && !PILOT.cmdr.run_id">
            <h3>tracks</h3>
            <div class="tracks">
                <div v-for="track in R.tracks" class="track edfx">
                    <div class="row keep">
                        <div class="col-sm-8 listed">
                            <h4>{{track.name}} <span>{{track.type}}</span></h4>
                            <p>{{track.desc}}</p>
                            <em><b>sponsor</b><span>{{track.sponsor}}</span></em>
                        </div>
                        <div class="col-sm-2">
                            <button v-on:click="new_run(track._id)"><i class="i-wind"></i> START RUN</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RUN LIST IN SETUP  -->

        <div class="runs ov ov-main ov-interact" v-if="state==='runs' && !PILOT.cmdr.run_id">
            <h5>active runs
                <button v-on:click="get_runs()" class="link"><i class="i-sync"></i> refresh</button>
            </h5>

            <div v-if="!R.runs.length" class="ov-center-top">
                <div class="alert edfx">
                    <i class="i-ed-alert"></i>
                    <h3>no active runs found</h3>
                    <p>you can host one from TRACKS section</p>
                </div>
            </div>


            <div v-if="R.runs.length">
                <div class="row run-item edfx" v-for="r in R.runs">
                    <div class="col-sm">
                        <small>run track</small>
                        <b>{{r.name}}</b>
                        <small>by: cmdr {{r.host.split('/')[1]}}</small>
                        <star-dist :dest="r.loc.st_id || r.loc.sys_id || r.loc.body_id"
                                   :pos="PILOT.cmdr.sys_id"></star-dist>
                    </div>
                    <div class="col-sm">
                        <small>racers ({{r.count_total}})</small>
                        <span v-for="pilot in r.pilots">CMDR {{pilot._id.split('/')[1]}}<br></span>
                    </div>
                    <div class="col-sm">
                        <small>run state</small>
                        {{r.status}}: READY {{r.count_ready}}/{{r.count_total}}
                    </div>
                    <div class="col-sm">
                        <button v-on:click="join_run(r._id)"><i class="i-wind"></i> join run</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ACTIVE RUN  -->

        <div class="active-run" v-if="PILOT.cmdr.run_id">

            <div class="run-status ov ov-top-line">
                <small>{{R.run.name}}</small>
                <div v-if="R.run.status === R.RUNST.SETUP">
                    <h2 class="edfx" v-if="R.run.c_down===null">waiting for other pilots</h2>
                    <h2 class="edfx" v-if="R.run.c_down!==null">-- {{R.run.c_down}} --</h2>
                </div>
                <div v-if="R.run.status === R.RUNST.RUNNING">
                    <h2 class="edfx" v-if="PILOT.dest.name">{{PILOT.dest.name}}</h2>
                    <h2 class="edfx" v-if="!PILOT.dest.name">{{R.run.pilots[PILOT.cmdr._id].status}}</h2>
                </div>
                <div v-if="R.run.status === R.RUNST.COMPLETE">
                    <h2 class="edfx">run complete</h2>
                </div>

            </div>

            <navigator class="ov ov-nav"></navigator>

            <div class="ov ov-center prepear" v-if="R.run.status === 'setup' && PILOT.dest.x === 0">
                <div class="alert edfx">
                    <h3 v-if="R.run.pilots[PILOT.cmdr._id].status !== R.RUNNER.READY">are you ready?</h3>
                    <h3 v-if="R.run.pilots[PILOT.cmdr._id].status === R.RUNNER.READY && R.run.c_down === null">prepear to start</h3>
                </div>
                <div class="ready-button" v-if="R.run.c_down === null">
                    <button v-on:click="run_ready()">
                        &nbsp;&nbsp; {{R.run.pilots[PILOT.cmdr._id].status === R.RUNNER.READY ? 'dismiss' : 'get ready!' }} &nbsp;&nbsp;
                    </button>
                </div>
            </div>

            <div class=" ov ov-left">
                <div class="run-pilots">
                    <div class="row keep pilot" v-for="(pilot, k) in R.run.chart">
                        <div class="col-sm">
                            <b>{{pilot.pos}} - {{pilot._id.split('/')[1]}}</b>
                        </div>
                        <div class="col-sm">
                            <div class="pilot-status" v-if="R.run.status === R.RUNST.SETUP">
                                <span v-if="pilot.x > 0">DIST:
                                    <star-dist v-if="pilot.x > 0"
                                               :dest="R.run.loc.st_id || R.run.loc.sys_id ||R.run.loc.body_id"
                                               :pos="pilot.sys_id"></star-dist>
                                </span>

                                <span v-if="pilot.x <= 0">{{pilot.status}}</span>

                            </div>
                            <div v-if="R.run.status !== R.RUNST.SETUP">
                                {{pilot.t | timing}} - {{pilot.status}}<br>
                                {{pilot.score}} Pt
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import Vue from 'vue'
    import Navigator from '../components/navigator'
    import {A} from '../components/alert'
    import NET from '../ctrl/net'
    import PILOT from '../ctrl/pilot'
    import StarPos from "../components/star-pos";
    import StarDist from "../components/star-dist";
    import tools from "../ctrl/tools";

    const R = {
        RUNST: {
            SETUP: 'setup',
            RUNNING: 'running',
            COMPLETE: 'complete',
            CLOSED: 'closed',

        },
        RUNNER: {
            JOINED: 'pending',
            READY: 'ready',
            IN: 'in-run',
            DEAD: 'dead',
            LEAVE: 'leave',
            FINISHED: 'finished',
            DISQILFIED: 'disquilified',
        },
        run: {
            _id: null,
            track_id: null,
            status: null,
            name: null,
            host: null,
            pilots: {},
            chart: [],
            count_ready: 0,
        },
        pos: null,
        runs: [],
        tracks: [],
    };

    export default {
        name: "run",
        components: {StarPos, StarDist, Navigator},
        data: () => {
            return {
                state: 'runs',
                R: R,
                PILOT: PILOT,
            }
        },
        mounted: function () {
            if (!this.R.tracks || !this.R.tracks.length) { this.get_tracks(); }
            this.get_runs();
        },
        methods: {
            get_tracks: function () {
                NET.api('s-tracks')
                    .then((res) => {
                        if (res.result) {
                            this.R.tracks.splice(0, this.R.tracks.length);
                            res.tracks.forEach(r => this.R.tracks.push(r));
                        } else {
                            A.error(res);
                        }
                    }).catch((err) => { console.log('s-tracks', err)});
            },
            get_runs: function () {
                this.R.runs.splice(0, this.R.runs.length);
                NET.send('run-list');
            },
            new_run: function (track_id) {
                NET.send('run-new', {track_id: track_id});
            },
            join_run: function (run_id) {
                NET.send('run-join', {run_id: run_id});
            },
            run_ready: function () {
                NET.send('run-ready', !(R.run.pilots[PILOT.cmdr._id].status === R.RUNNER.READY));
            },
            leave_run: function () {
                if (this.R.run.status === R.RUNST.RUNNING) {
                    return A.warn({
                        text: 'are you sure that you want to leave?',
                        desc: 'it will discard all your current race score and affect statisctic',
                        acts: {
                            'yes, leave': () => NET.send('run-leave'),
                            'cancel': null
                        }
                    })
                } else {
                    NET.send('run-leave');
                }
            }
        }
    }

    NET.on('uni:run-upd', (run) => {
        R.run._id = run._id;
        R.run.track_id = run.track_id;
        R.run.status = run.status;
        R.run.name = run.name;
        R.run.host = run.host;
        R.run.c_down = run.c_down;
        R.run.count_ready = 0;
        R.run.count_total = 0;
        Vue.set(R.run, 'pilots', run.pilots);
        Vue.set(R.run, 'loc', run.loc);
        run_chart_sort();
    });

    NET.on('uni:run-upd-cmdr', (pilot) => {
        Vue.set(R.run.pilots, pilot._id, pilot);
        run_chart_sort();
    });

    function run_chart_sort() {
        R.run.chart.splice(0, R.run.chart.length);
        for (let i in R.run.pilots) {
            R.run.chart.push(R.run.pilots[i]);
        }
        R.run.chart.sort((a, b) => a.pos - b.pos);
    }

    NET.on('uni:run-status', (r) => {
        r.count_ready = 0;
        r.count_total = 0;
        for (let i in r.pilots) {
            if (r.pilots[i].status === R.RUNNER.READY) r.count_ready++;
            r.count_total++
        }

        for (let i = 0; i < R.runs.length; i++) {
            if (R.runs[i]._id === r._id) {
                if (r.status !== R.RUNST.SETUP) {
                    return R.runs.splice(i, 1);
                } else {
                    return Vue.set(R.runs, i, r);
                }
            }
        }
        if (r.status === R.RUNST.SETUP) R.runs.unshift(r);
    });

    NET.on('uni:run-list', (runs) => {
        R.runs.splice(0, R.runs.length);
        runs.forEach((r) => {
            R.runs.push(r);
            r.count_ready = 0;
            r.count_total = 0;
            for (let i in r.pilots) {
                if (r.pilots[i].status === R.RUNNER.READY) r.count_ready++;
                r.count_total++
            }
        });
    });

</script>

<style lang="scss">
    @import '../styles/vars';
    .tracks {
        .track { padding: 0.5em 0; margin: 0.5em 0; border-top: 1px solid darken($ui-fg, 50%)}
    }
    .prepear {
        .ready-button { text-align: center; font-size: 1.2em}
        .alert i { margin-bottom: 0.5em}
        .alert h1 { font-size: 2em}
    }
    .run-status {
        text-align: center;
        padding: 0;
        @include hcaps();
        small { font-size: 1.1em; color: $blue }
        h2 { font-size: 2em; line-height: 1.1em; margin: 0; padding: 0.3em 0 0.5em 0; }
    }
    .run-pilots {
        padding: 1em 0;
        @include hcaps();
        b { color: $orange; font-weight: normal }
        .pilot { margin: 0 0.5em}
    }
    .run-item {
        &:last-of-type { border-bottom: 1px solid #1e1e23; }
        padding-top: 1em;
        border-top: 1px solid #1e1e23;
        margin-top: 1em;
        @include hcaps();
        b { color: $orange; font-weight: normal }
        small { display: block; line-height: 1em; color: lighten($ui-text, 15%); padding-bottom: 0.3em }
        div { padding-bottom: 0.5em}
    }
</style>