<template>
    <div v-if="A.busy.show || A.stack.length">
        <div v-bind:class="['alert', 'modal', A.busy.type]" v-if="A.busy.show">
            <div class="edfx">
                <i class="i-ed-alert"></i>
                <h4 v-if="A.busy.text">{{A.busy.text}}</h4>
                <p v-if="A.busy.desc">{{A.busy.desc}}</p>
            </div>
        </div>
        <div v-if="A.stack.length && !A.busy.show" v-bind:class="['alert', 'modal', A.stack[0].type]">
            <div class="edfx">
                <i class="i-ed-alert"></i>
                <h4>{{A.stack[0].text}}</h4>
                <p v-if="A.stack[0].desc">{{A.stack[0].desc}}</p>

                <div class="acts" v-if="A.stack[0].prompt" v-for="(prompt, p) in A.stack[0].prompt">
                    <div class="ui">
                        <input type="text" v-model="prompt.val">
                        <label>{{p}}</label>
                    </div>
                    <button v-for="(cb, p_act) in prompt.acts" v-on:click="prompt_act(p, p_act, prompt.val)">{{p_act}}</button>
                </div>

                <div class="acts" v-if="A.stack[0].acts">
                    <button v-for="(cb, action) in A.stack[0].acts" v-on:click="act(action)">{{action}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
     const A = {
        busy: {
            show: false,
            type: 'info',
            text: '',
            desc: '',
        },
        stack: [],
        add: function (opt, the_only = false) {
            if (the_only) this.stack.splice(0, this.stack.length);
            if (!opt.acts && !opt.prompt) opt.acts = {'roger that': null};
            this.stack.push(opt);
        },
        info: function (opt, the_only = false) {
            opt.type = 'info';
            this.add(opt, the_only);
        },
        warn: function (opt, the_only = false) {
            opt.type = 'warn';
            this.add(opt, the_only);
        },
        error: function (opt, the_only = false) {
            console.log(opt);
            opt.type = 'error';
            this.add(opt, the_only);
        },
        lock: function (opt = {}) {
            this.busy.show = true;
            this.busy.text = opt.text || 'processing, please wait';
            this.busy.desc = opt.desc || '';
            this.busy.type = opt.type || 'info';
        },
        release: function () {
            this.busy.show = false;
            return this;
        }
    };
    export {A}
    export default {
        name: "alert",
        data: () => { return {A: A} },
        methods: {
            act: function (ac) {
                if (this.A.stack[0].acts[ac])
                    this.A.stack[0].acts[ac]();
                this.A.stack.splice(0, 1);
            },
            prompt_act: function (p, act, val) {
                if (this.A.stack[0].prompt[p].acts[act](val)) this.A.stack.splice(0, 1);
            },
        }
    }
</script>

<style lang="scss">
    @import "../styles/vars";
    .alert.modal {
        position: fixed;
        left: 0; top: 0; right: 0; bottom: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, .7);
        margin: 0 auto; padding: 15vh 0;
        font-size: 1em;
        & > * { width: 680px; max-width: 90%; margin-left: auto; margin-right: auto}
        .acts { padding: 1.5em 0; margin: 1em auto; border-top: 1px solid rgba(255, 255, 255, .1);
            button { padding: 0 1em; margin: 0 0.5em }
        }
    }
</style>