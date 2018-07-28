<template>
    <div class="ev fsdjump">
        <h3>
            <span class="event">fsd jump: </span>
            <span class="system solid-word"> {{jump.StarSystem}}</span>
            <small>{{jump.timestamp}}</small>
        </h3>
        <div class="dist">
            <b>distance: {{jump.JumpDist}} ly</b>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ev-fsdjump",
        props: {
            rec: {
                type: Object,
                required: true,
            }
        },
        data: function () { return {jump: this.rec} },
        methods: {
            // here wil be some methods to analyze body
        }
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    .ev.fsdjump {
        h3 {
            padding: 0.2em 0 0.4em 0;
            .event { color: $blue}
            .system { color: lighten($ui-text, 20%)}

            small { display: block; color: darken($ui-text, 20%); padding-top: 0.1em}
        }
        .dist {}
        .dist small {}
        .dist b { @include hcaps()}
    }
</style>