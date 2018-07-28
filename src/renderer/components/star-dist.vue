<template>
    <span v-bind:class="['star-dist', err ? 'err' : '']">{{dist}}</span>
</template>

<script>
    import TOOLS from '../ctrl/tools'

    export default {
        name: "starpos",
        props: {
            pos: {default: () => { return [0, 0, 0]}},
            dest: {default: () => { return [0, 0, 0]}},
        },
        data: () => {
            return {
                err: false,
                v1: [0, 0, 0],
                v2: [0, 0, 0],
                dist: 0,
            }
        },
        mounted: function () {
            this.recalc();
        },
        watch: {
            pos: function (n, o) {
                this.recalc();
            },
            dest: function (n, o) {
                this.recalc();
            },
        },
        methods: {
            recalc: function () {
                if (!this.dest) {
                    this.dist = -1;
                    this.err = true;
                    return;
                }
                this.err = false;
                this.v1 = typeof this.pos === 'string' ? this.pos.split('@')[1].split('/')[0].split(':') : this.pos.map(x => x);
                this.v2 = typeof this.dest === 'string' ? this.dest.split('@')[1].split('/')[0].split(':') : this.dest.map(x => x);
                let d = TOOLS.distance(this.v1, this.v2) / 32;
                this.dist = d ? this.$options.filters.nn(d, 0, 0) + ' ly' : 'curr. sustem';
            }
        }
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    .star-dist { @include hcaps(); }
</style>