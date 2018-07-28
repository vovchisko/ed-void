import {J, ISSH} from './journal'

const CFG = J.cfg;

CFG.apply_ui_cfg = function () {
    document.body.style.fontSize = this.ui_font_size;
    document.body.setAttribute('edfx-lv', this.ui_fx_level)
};

CFG.save = function () {
    J.cfg_save();
};

if (!CFG.c_mode) CFG.c_mode = 'cfg';
if (!CFG.ui_font_size) CFG.ui_font_size = '100%';
if (!CFG.ui_fx_level) CFG.ui_fx_level = 'full';


export default CFG;

