<template>
    <div v-if="env.system">
        <div class="row curr-sys-summ keep">
            <div class="col-sm">
                <h3>
                    <small>current system:</small>
                    {{env.system.name}}
                </h3>
            </div>
            <div class="col-sm">
                <h3>
                    <small>scanned bodies:</small>
                    <span><u>{{exp.curr_system.scanned}}/{{env.system.ds_count}}</u>  {{exp.curr_system.total | nn()}} Cr </span>
                </h3>
            </div>
        </div>
        <br>
        <div v-if="exp.curr_system">
            <em v-for="(b,k) in exp.curr_system.bodies"><b>{{env.system.name}} {{k}}</b><span>{{b.v | nn()}} <u>Cr</u></span></em>
        </div>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot';

    export default {
        name: "edata-here",
        data: () => {
            return {
                exp: PILOT.exp,
                env: PILOT.env
            }
        },
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    .curr-sys-summ {
        h3 {
            padding: 0.5em 0 0 0;
            font-size: 1.3em; color: lighten($ui-text, 20%);
            small { display: block; color: darken($ui-text, 15%); }
            span { color: $ui-text;
                u { color: $cyan; padding-right: 0.4em }
            }
        }
    }
</style>