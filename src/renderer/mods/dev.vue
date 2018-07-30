<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>
        
        <div v-if="c_tab === 'log'">
            <pre v-for="l in log">{{l[0]}} : {{l[1]}}</pre>
        </div>
        
        <div v-if="c_tab === 'stat'" class="container-fluid">
            <div class="row">
                <div class="col-sm">
                    <pre>CMDR: {{PILOT.cmdr}}</pre>
                </div>
                <div class="col-sm">
                    <pre>PILOT:DEST {{PILOT.dest}}</pre>
                </div>
            </div>
            
            <div class="row">
                <div class="col-sm">
                    <pre>PILOT:STAT {{PILOT.status}}</pre>
                </div>
                <div class="col-sm">
                    <pre>CFG: {{CFG}}</pre>
                </div>
            
            </div>
        </div>
        
        <div v-if="c_tab === 'pipe'">
            <pre>{{pipe}}</pre>
        </div>
        <div v-if="c_tab === 'uni'">
            <pre>{{uni}}</pre>
        </div>
        
        <div class="container-fluid" v-if="c_tab === 'test'">
            mundii:
            <star-dist dest="mundii@2738:-34:-12" :pos="PILOT.cmdr.starpos"></star-dist>
            <br>
            deciat:
            <star-dist dest="deciat@3924:-26:-1513" pos="mundii@2738:-34:-12"></star-dist>
            <br>
            deciat body:
            <star-dist dest="deciat@3924:-26:-1513/fareseer inc" :pos="PILOT.cmdr.starpos"></star-dist>
        </div>
    </div>
</template>

<script>
    import NET from '../ctrl/net'
    import PILOT from '../ctrl/pilot'
    import CFG from '../ctrl/cfg'

    import InputBody from '../components/input-body'
    import InputSystem from '../components/input-system'
    import InputStation from '../components/input-station'
    import StarDist from '../components/star-dist'
    import StarPos from '../components/star-pos'
    import Navigator from "../components/navigator";

    const dev = {
        pipe: [],
        uni: [],
        log: [],
    };

    export default {
        name: "dev",
        components: {Navigator, InputBody, InputSystem, InputStation, StarDist, StarPos},
        data: () => {
            return {
                c_tab: 'test',
                tabs: ['test', 'log', 'stat', 'uni', 'pipe'],
                PILOT: PILOT, CFG: CFG,
                dest: PILOT.dest,
                env: PILOT.env,
                status: PILOT.status,
                log: dev.log,
                stat: dev.stat,
                pipe: dev.pipe,
                uni: dev.uni,
                test: {
                    sys_id: null,
                    st_id: null,
                    body_id: null,
                    a: [0, 0, 0],
                    b: [0, 0, 0],
                },
            }
        },
        methods: {
            on_change: function (e) {
                console.log('PEW!', e);
            },

            external_change: function () {
                this.test.sys_id = 'apoyota@-1078:-139:1964';
                this.test.body_id = 'apoyota@-1078:-139:1964/b 4';
                this.test.st_id = 'mundii@2738:-34:-12/elder hub';
                this.test.a = [50, 6520, 567];
                this.test.b = [33, 15, 21];
            }

        }
    }

    NET.on('ping', (dat) => {
        let log = dev.log;
        let lag = 0;
        if (log.length)
            lag = dat.t - log[0][0];
        log.unshift([parseInt(dat.t), lag || 0]);
        if (log.length > 32) log.splice(log.length - 1, 1)
    });

    NET.on('net:any', (c, dat) => {
        let p = c.split(':')[0];
        if (p === 'uni') {
            dev.uni.unshift({c: c, dat: dat});
            if (dev.uni.length > 32) dev.uni.splice(-1);
        }

        if (p === 'pipe') {
            dev.pipe.unshift({c: c, dat: dat});
            if (dev.pipe.length > 32) dev.pipe.splice(-1);
        }
    });

</script>

<style lang="scss">

</style>