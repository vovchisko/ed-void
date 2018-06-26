<template>
    <div id="auth">
        <form>

            <h2>ed-void login</h2>

            <div v-bind:class="['msg',msg.type]">{{msg.text}}</div>

            <div class="ui">
                <input type="email" v-model="auth.email"/>
                <label>Email</label>
            </div>

            <div class="ui">
                <input type="password" v-model="auth.pass"/>
                <label>Password</label>
            </div>

            <div class="ui">
                <button type="button" v-on:click="signin()">Sign in</button>
            </div>

            <div class="ui links">
                <a href="http://ed-void.com/" target="_blank">New Pilot</a>
                <a href="http://ed-void.com/" target="_blank">reset password</a>
            </div>
        </form>
    </div>
</template>

<script>

    import {J} from '../ctrl/journal';

    export default {
        name: "auth",
        data: () => {
            return {
                sign_: 'in',
                msg: {type: '', text: 'welcome back commander'},
                auth: {
                    email: '',
                    pass: '',
                }
            }
        },
        methods: {
            signin: function () {
                J.get_api_key(this.auth.email, this.auth.pass)
                    .then((r) => {
                        if (!r.result) {
                            this.msg.type = r.type;
                            this.msg.text = r.text;
                        } else {
                            J.go();
                        }
                    })
                    .catch((r) => {
                        this.msg.type = r.type;
                        this.msg.text = r.text;
                    });
            }
        }
    }

</script>

<style lang="scss">
    @import "../styles/vars";
    #auth {
        .all-actions { text-align: center; font-size: 0.9em;
            button { display: inline-block; margin: 0 5px;}
        }
        h2 { @include hcaps(); font-size: 2em; }
        form {
            width: 18em;
            margin: 0 auto;
            padding: calc(50vh - 300px + 1em) 0 3em 0;
            border: $ui-bg;
            input, button {
                display: block; clear: both; width: 100%;
            }
            button { }
            .msg {
                text-transform: uppercase; margin: 10px 0 10px 0;
                &.error { color: $ui-err;}
            }
            .ui.links { text-align: center;
                button { display: inline-block; margin: 0 1em; clear: none; width: auto}
            }
        }
    }
</style>