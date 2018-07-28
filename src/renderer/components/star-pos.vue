<template>
    <span v-bind:class="['star-pos', err ? 'err' : '']">
        {{e_pos[0]}} : {{e_pos[1]}} : {{e_pos[2]}}
    </span>
</template>

<script>
    export default {
        name: "starpos",
        props: {
            pos: {type: Array, default: [0, 0, 0]}
        },
        data: () => {return {e_pos: [0, 0, 0]}},
        mounted: function () {
            this.mount_starpos(this.pos);
        },
        watch: {
            pos: function (n, o) { this.mount_starpos(n);}
        },
        methods: {
            mount_starpos: function (pos) {
                this.e_pos = pos.map(x => this.$options.filters.nn(x / 32, 2, 2));
            }
        }
    }
</script>

<style lang="scss">
    .star-pos { }
</style>