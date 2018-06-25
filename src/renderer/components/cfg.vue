<template>
    <div id="cfg">
        <div class="row">
            <div class="col-sm">
                <h2>overlay ui settings </h2>

                <div class="ui short">
                    <select v-model="cfg.ui_font_size" @change="cgf_apply()">
                        <option v-for="i in cfg._font_size_vars" v-model="cfg._font_size_vars[i]">{{i}}</option>
                    </select>
                    <label>font size</label>
                </div>

                <div class="ui short">
                    <select v-model="cfg.ui_fx_level" @change="cgf_apply()">
                        <option v-for="i in cfg._fx_level_vars" v-model="cfg._fx_level_vars[i]">{{i}}</option>
                    </select>
                    <label>ui effects</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Data from '../services/data';

    export default {
        name: 'cfg',
        data: () => {
            return {
                data: Data,
                cfg: Data.cfg,
            }
        },
        mounted: function () { this.cgf_apply(); },
        methods: {
            cgf_apply: function () {
                Data.apply_ui_cfg();
                Data.save();
            },
        }
    }

</script>

<style lang="scss">
    @import '../styles/vars';
    #cfg {

        .tip-box {
            margin: 2em 0;
            h5 > button.link { display: inline; line-height: inherit; vertical-align: inherit; float: right; margin-right: 1em; }
            &.email {
                .valid { color: lighten($green, 0%); }
                .not-valid { color: darken($red, 15%); }
            }
            &.api-key {
                .icon { color: $purple; }
            }
            &.pass {
                .icon { color: $orange}
                .msg { padding-top: 0.5em; text-transform: uppercase;
                    &.error { color: $ui-err;}
                    &.info { color: $green;}
                }
            }
        }
        .help a { white-space: nowrap; color: lighten($ui-text, 15%); font-size: 0.9em; text-transform: uppercase}
        .help a:hover { white-space: nowrap; color: #fff; @include semiglitch-text(); text-decoration: none;}
        .help a:active { white-space: nowrap; color: #fff; @include glitch-text()}
        .img-icon { max-height: 2em; max-width: 2em; display: inline-block}
        button.logout { float: right; margin: 0 }
    }
</style>