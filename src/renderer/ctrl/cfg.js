const CFG = {

    ui_font_size: (localStorage.getItem('ui_font_size')) || this.ui_font_size,
    ui_fx_level: (localStorage.getItem('ui_fx_level')) || this.ui_fx_level,

    _font_size_vars: new Array(17).fill(0).map((x, i) => {return i * 10 + 40 + '%'}),
    _fx_level_vars: ['full', 'medium', 'low', 'disabled'],

    save: function () {
        localStorage.setItem('ui_font_size', this.ui_font_size);
        localStorage.setItem('ui_fx_level', this.ui_fx_level);
    },

    apply_ui_cfg: function () {
        document.body.style.fontSize = this.ui_font_size;
        document.body.className = 'edfx-lv-' + this.ui_fx_level;
    },
};

CFG.apply_ui_cfg();

export default CFG;





