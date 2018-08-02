<template>
 
        <div id="navbar" class="container-fluid">
            <div class="nav-left">
                <button v-on:click="toggle=!toggle" class=" mode" v-bind:class=" toggle? 'active': ''">
                    <i class="i-menu"></i> {{MODE.c_mode}}<i class="caret i-chevron-down"></i>
                </button>
                
                <nav v-if="toggle" class="edfx edfx-fast">
                    <button v-for="(mode, key) in MODE.list" v-bind:class="MODE.c_mode === mode ? 'semi-active':''" v-on:click="MODE.go(mode); toggle=false">{{mode}}</button>
                </nav>
            </div>
            <div id="nav-clickout" v-if="toggle" v-on:click="toggle=false"></div>
        </div>

</template>

<script>
    import MODE from '../ctrl/mode';

    export default {
        name: 'navbar',
        data: () => {return {MODE: MODE, toggle: false} },
    }
</script>

<style lang="scss">
    @import "../styles/vars";
    #navbar {
        line-height: $ui-line-h;
        height: $ui-line-h;
        margin-top: 5px; margin-bottom: 0;
        padding-top: 0; padding-bottom: 0;
        
        //layout
        .nav-left { float: left; white-space: nowrap; position: relative; z-index: 2; width: 6em; }
        
        //styles
        button.mode {
            white-space: nowrap; width: 100%; float: left;
            .caret { font-size: 1.1em; width: 0.7em; display: inline-block; }
            &.active .caret { }
        }
        nav {
            padding: 10px 0;
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 2;
            button {
                background-color: $ui-bg;
                margin: 0 5px 5px 0; display: block; width: 7em;
                span { display: inline}
            }
        }
        .nav-header {
            padding: 1px 5px; text-transform: uppercase; color: lighten($ui-text, 15%);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; }
        
        #nav-clickout { position: fixed; left: 0; top: 0; right: 0; bottom: 0; z-index: 1}
    }
    header {
        @include hcaps();
        margin: -$ui-line-h 0 0.2em 6em;
        padding: 0 0 0 0.5em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: $ui-line-h;
        height: $ui-line-h;
        color: lighten($ui-text, 15%);
        button { margin: 0 0.4em 0 0; }
        button.link { padding: 0 0.3em 0 0}
        button.link i { font-size: 1.1em; margin-right: 0.2em}
    }
</style>
