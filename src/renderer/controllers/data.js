//import Net from './network';

import extend from 'deep-extend';

class DataStorage {
    constructor() {
        this._null = {};

        this.app = {
            overload: false,
        };

        this.cfg = {
            ui_font_size: '100%',
            ui_fx_level: 'full',
            _font_size_vars: new Array(17).fill(0).map((x, i) => {return i * 10 + 40 + '%'}),
            _fx_level_vars: ['full', 'medium', 'low', 'disabled'],
            journal_path: '',
        };

        this.modes = {
            modes: {
                'cfg': 'cfg',
            },
            c_mode: 'cfg'
        };

        this.auth = {
            email: '',
            pass: '',
        };

        this.navi = {
            style_ruler: {'background-position-x': 0},
            style_dest: {'background-position-x': 0},
            pos: {
                lat: 0, lon: 0, alt: 0, head: 0
            },
            dest: {
                enabled: false,
                lat: 0, lon: 0, azi: 0, dist: 0,
                align: ''
            },
            body: {name: null, radius: 0, gravity: 0, c_radius_km: 0}
        };

        this.vass = {
            recent: [],
            exp: {
                total: 0,
                sys_count: 0,
                summ: {s: 0, p: 0, c: 0},
                curr_system: {scanned: 0, total: 0, bodies: {}},
                systems: []
            }
        };


        this.env = {
            system: null,
            body: null,
            station: null,
        };

        this.init();
    }

    init() {

        for (let i in this) {
            if (i[0] !== '_') {
                this._null[i] = {};
                extend(this._null[i], this[i])
            }
        }

        this.modes.c_mode = (localStorage.getItem('c_mode')) || this.modes.c_mode;
        this.cfg.ui_font_size = (localStorage.getItem('ui_font_size')) || this.cfg.ui_font_size;
        this.cfg.ui_fx_level = (localStorage.getItem('ui_fx_level')) || this.cfg.ui_fx_level;

        this.apply_ui_cfg();
    }

    save() {
        //save some data to locastorage
        localStorage.setItem('c_mode', this.modes.c_mode);
        localStorage.setItem('ui_font_size', this.cfg.ui_font_size);
        localStorage.setItem('ui_fx_level', this.cfg.ui_fx_level);
    }

    apply_ui_cfg() {
        document.body.style.fontSize = this.cfg.ui_font_size;
        document.body.className = 'edfx-lv-' + this.cfg.ui_fx_level;
    }
}

const Data = new DataStorage();
export default Data;





