<template>
    <div class="ui input-search" v-bind:class="list.length || focused ?'z-overall':''">
        <input v-model="search" @input="do_search()"
               v-bind:placeholder="station_name"
               v-on:blur="focused=false; reset_field(true);"
               v-on:focus="focused=true; reset_field(); $event.target.select()"
               v-on:keydown="keydown($event)">
        <label v-if="!!e_label">
            {{e_label}}
            <span class="inline-msg" v-if="focused && searching">Search...</span>
            <span class="inline-msg" v-if="did_search && focused && !searching && !list.length && search.length >= 2">No Results</span>
        </label>
        <div class="list edfx" v-if="list.length">
            <button class="link" v-for="b in list" v-on:mousedown="select_station(b._id)">
                <i class="i-profile-card"></i> {{b.name}} <small>{{b.sys_name}} <star-dist :dest="b.starpos"></star-dist> + {{b.arrival | nn(2,2)}}ls</small>
            </button>
            <button v-if="list.length" class="link cancel" v-on:click="cleanup(); reset_field()"><i class="i-chevron-up"></i> cancel</button>
        </div>
        <button v-if="e_id" class="link remove" v-on:click="select_station(null)"><i class="i-cross"></i> clear</button>
    </div>
</template>

<script>
    import Vue from 'vue'
    import NET from '../ctrl/net'
    import TOOLS from '../ctrl/tools';
    import StarDist from './star-dist';

    export default {
        name: "input-station",
        components: {StarDist},
        props: {
            id: {default: ''},
            label: {default: ''},
        },
        data: () => {
            return {
                searching: false,
                search: '',
                station_name: '',
                list: [],
                focused: false,
                did_search: false,

                e_id: null,
                e_label: null,
            }
        },
        mounted: function () {
            this.e_label = this.label;
            this.select_station(this.id, true);
        },
        watch: {
            id: function (n, o) {if (n !== this.e_id) this.select_station(n, true); },
            label: function (n, o) { if (n !== o) this.e_label = n;}
        },
        methods: {
            reset_field: function (and_clear = false) {
                this.station_name = this.e_id ? TOOLS.station_name_from_id(this.e_id) : 'station not selected';
                this.search = this.e_id ? this.station_name : '';
                this.searching = false;
                this.did_search = false;
                if (and_clear) setTimeout(() => { this.cleanup() }, 10)
            },
            do_search: function () {
                if (this.search.length < 2) return this.cleanup();
                this.searching = true;
                this.did_search = true;

                NET.api('s-stations', {search: this.search}, false)
                    .then((result) => {
                        Vue.set(this, 'list', result.stations);
                        this.searching = false;
                    })
                    .catch((err) => {
                        this.searching = false;
                        console.log(err);
                    });
            },
            select_station: function (st_id = null, external = false) {
                this.e_id = st_id;
                if (!external) this.cleanup();
                this.reset_field();
                if (!external) this.$emit('update:id', this.e_id);
            },
            cleanup: function () {
                this.list.splice(0, this.list.length);
            },
            keydown: function (ev) {
                if (ev.key === 'Escape') {
                    ev.srcElement.blur();
                    this.cleanup();
                }
            }
        }
    }
</script>

<style lang="scss">
</style>