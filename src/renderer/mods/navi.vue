<template>
    <div id="navi">

        <header>{{env.system? env.system.name : 'UNDEFINED SYSTEM'}}{{env.body ? ' / ' + env.body.short_name : '' }}{{env.station ? ' / ' + env.station.name : '' }}</header>

        <navigator></navigator>

        <div class="container-fluid">

            <div class="alert info edfx" v-if="N.PILOT.cmdr.run_id">
                <i class="i-ed-alert"></i>
                <h4>navigation module read-only</h4>
                <p>you can't change your destination manually duiring void-run</p>
            </div>

            <div class="row" v-if="!N.PILOT.cmdr.run_id">
                <div class="col-sm">
                    <div class="ui" v-if="N.edit">
                        <button @click="set_goal(g)" v-for="g in N.DGOAL" v-bind:class="N.PILOT.dest.goal === g ? 'active':''">{{g}}</button>
                    </div>

                    <div v-if="N.edit">
                        <div v-if="N.PILOT.dest.goal === N.DGOAL.STATION">
                            <input-station :id.sync="N.PILOT.dest.st_id" label="target station"></input-station>
                        </div>

                        <div v-if="N.PILOT.dest.goal ===  N.DGOAL.SYSTEM">
                            <input-system :id.sync="N.PILOT.dest.sys_id" label="target system"></input-system>
                        </div>

                        <div v-if="N.PILOT.dest.goal ===  N.DGOAL.BODY">
                            <input-body :id.sync="N.PILOT.dest.body_id" label="target body (approach)"></input-body>
                        </div>

                        <div v-if="N.PILOT.dest.goal === N.DGOAL.SURFACE">
                            <input-body :id.sync="N.PILOT.dest.body_id" label="target body"></input-body>
                            <div class="ui">
                                <input type="number" min="-90" max="90" step="any" @focus="$event.target.select()" v-model="N.PILOT.dest.lat">
                                <label>lat</label>
                            </div>
                            <div class="ui">
                                <input type="number" min="-180" max="180" step="any" @focus="$event.target.select()" v-model="N.PILOT.dest.lon">
                                <label>lon</label>
                            </div>
                            <div class="ui" v-if="N.PILOT.dest.f.includes('-CR')">
                                <input type="number" @focus="$event.target.select()" v-model="N.PILOT.dest.r">
                                <label>target body radius</label>
                            </div>
                        </div>

                    </div>

                    <div class="ui">
                        <button v-if="!N.edit" v-on:click="dest_edit()"><i class="i-aim"></i> edit destination</button>
                        <button v-if="N.edit" v-on:click="dest_apply()"><i class="i-aim"></i> apply destination</button>&nbsp;
                        <button v-on:click="dest_clear()" v-if="N.PILOT.dest.goal"><i class="i-cross"></i> clear</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import NET from '../ctrl/net'
    import PILOT from '../ctrl/pilot'
    import InputBody from "../components/input-body";
    import InputStation from "../components/input-station";
    import InputSystem from "../components/input-system";
    import Navigator from "../components/navigator";
    import {A} from '../components/alert';

    const N = {
        PILOT: PILOT,
        dest_align: '',
        edit: false,

        DGOAL: {
            SURFACE: 'surface',
            BODY: 'body',
            SYSTEM: 'system',
            STATION: 'station',
        },
    };

    export default {
        name: "navi",
        components: {InputSystem, InputStation, InputBody, Navigator},
        data: () => {
            return {
                N: N,
                env: PILOT.env,
            }
        },
        methods: {
            set_goal: function (g) {
                N.PILOT.dest.goal = g;
            },
            dest_clear: function () {
                NET.send('dest-set', null);
                N.edit = false;
            },
            dest_edit: function () {
                NET.send('dest-toggle', false);
                if (!N.PILOT.dest.goal) N.PILOT.dest.goal = N.DGOAL.SURFACE;
                N.edit = true;
            },
            dest_apply: function () {
                NET.send('dest-set', N.PILOT.dest);
                N.edit = false;
            },
        }
    }

    NET.on('uni:dest-set', (dest) => {
        if (dest.f && dest.f.includes('/ER')) { N.edit = true; }
    });


</script>

<style lang="scss">
    @import "../styles/vars";

    // NAV MODULE

    #navi {
        .alert.info { margin-top: 2em}
    }
</style>

