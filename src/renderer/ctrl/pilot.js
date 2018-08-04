import NET from './net'
import Vue from 'vue'

class PilotDetails {
    constructor() {
        this.cmdr = {
            name: null,
            sys_id: null,
            body_id: null,
            st_id: null,
            starpos: [0, 0, 0],
            last_rec: null,
        };
        this.status = {
            flags: 0,
            pips: [0, 0, 0],
            fgroup: 0,
            lat: null,
            lon: null,
            alt: null,
            head: null,
            focus: null,
        };
        this.dest = {
            name: '',
            enabled: false,
            goal: null,
            lat: null, lon: null,
            head: null,
            dist: null,
            r: null,
            sys_id: null,
            body_id: null,
            st_id: null,
            f: '',
            x: 0,
            min_alt: null,
            min_dist: null,
        };
        this.env = {body: null, system: null, station: null};
        this.exp = {
            total: 0,
            sys_count: 0,
            summ: {s: 0, p: 0, c: 0},
            curr_system: {scanned: 0, total: 0, bodies: {}},
            systems: []
        }
    }

    dest_clear() {
        Vue.set(this, 'dest', {
            enabled: false,
            goal: null,
            lat: null, lon: null, head: null, dist: null, r: null,
            sys_id: null,
            body_id: null,
            st_id: null,
            f: '',
            x: 0,
        });
    }


    dest_set(dest) {
        this.dest_clear();
        Vue.util.extend(this.dest, dest);
    }

    push_exp_summ(dat) {
        let exp = this.exp;

        exp.total = dat.total;
        exp.sys_count = dat.sys_count;

        Vue.set(exp.curr_system, 'bodies', {});

        exp.curr_system.total = 0;
        exp.curr_system.scanned = 0;

        if (dat.curr_system) {
            exp.curr_system.bodies = dat.curr_system.bodies;
            for (let i in exp.curr_system.bodies) {
                exp.curr_system.scanned++;
                exp.curr_system.total += exp.curr_system.bodies[i].v;
            }
        }

        for (let i in dat.summ)
            exp.summ[i] = dat.summ[i];

        if (dat.systems) {
            exp.systems.splice(0, exp.systems.length);
            for (let s in dat.systems) {
                let s_data = {
                    name: s,
                    val: 0,
                    upd: dat.systems[s].upd,
                    bodies: dat.systems[s].bodies
                };
                for (let i in s_data.bodies) s_data.val += s_data.bodies[i].v;
                exp.systems.push(s_data);
            }

            exp.systems.sort((a, b) => {
                if (a.upd > b.upd) { return -1; }
                if (a.upd < b.upd) { return 1; }
                return 0
            });
        }
    }
}

const PILOT = new PilotDetails();


NET.on('uni:exp-data', (data) => { PILOT.push_exp_summ(data)});
NET.on('uni:dest-set', (dest) => PILOT.dest_set(dest));
NET.on('uni:dest', (dest) => Vue.util.extend(PILOT.dest, dest));
NET.on('uni:cmdr', (cmdr) => Vue.set(PILOT, 'cmdr', cmdr));
NET.on('uni:status', (status) => Vue.set(PILOT, 'status', status));
NET.on('uni:c_system', (system) => Vue.set(PILOT.env, 'system', system));
NET.on('uni:c_body', (body) => Vue.set(PILOT.env, 'body', body));
NET.on('uni:c_station', (station) => Vue.set(PILOT.env, 'station', station));

export default PILOT;