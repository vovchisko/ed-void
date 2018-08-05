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
                <button type="submit" v-on:click="signin($event)">Sign in</button>
            </div>

            <div class="ui links">
                <a class="button link" href="http://ed-void.com/" target="_blank">New Pilot</a>
                <a class="button link" href="http://ed-void.com/" target="_blank">reset password</a>
            </div>

            <div class="version">
            </div>
        </form>
    </div>
</template>

<script>

    import {J} from '../ctrl/journal';
    import MODE from '../ctrl/mode';
    import {A} from '../components/alert'

    export default {
        name: "auth",
        data: () => {
            return {
                sign_: 'in',
                msg: {type: '', text: 'welcome back commander'},
                auth: {
                    email: '',
                    pass: '',
                },
                MODE: MODE
            }
        },
        methods: {
            signin: function (event) {
                if (event) event.preventDefault();
                A.lock({text: 'connecting to ed-void'});
                J.get_api_key(this.auth.email, this.auth.pass)
                    .then((r) => {
                        A.release();
                        if (!r.result) {
                            A.add(r);
                        } else {
                            J.go();
                        }
                    })
                    .catch((r) => {
                        A.release();
                        A.add(r);
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
            margin: 2em auto 0 auto;
            padding: calc(50vh - 300px + 1em) 0 3em 0;
            border: $ui-bg;
            input, button {
                display: block; clear: both; width: 100%;
            }
            .msg {
                text-transform: uppercase; margin: 10px 0 10px 0;
                &.error { color: $ui-err;}
            }
            .ui.links { text-align: center;
                button, a.button { display: inline-block; margin: 0 1em; clear: none; width: auto; @include hcaps}
            }
        }
    }
</style>