<template>
    Clicked coordinates: {{ clickedCoordinates }}
    commentModeEnabled: {{ commentModeEnabled }}
    <v-col cols="1" sm="1" style="position:absolute; left: 0; top:0; z-index:999">
        <v-btn rounded="pill" color="secondary" @click="toggleCommentPopup">
            Comment
        </v-btn>
        <v-btn rounded="pill" color="primary" @click="setLineDrawToggle(); drawLine()" class="mt-2">
            Draw Line
        </v-btn>
    </v-col>

    <div v-if="commentModeEnabled === true && clickedCoordinates.length > 0">SHOWN</div>
    <div v-else> NOT SHOWN</div>

</template>

<script setup>
import CommentPopupContent from '@/components/CommentPopupContent.vue'
import { ref, createApp, onBeforeUpdate } from "vue"
import { useStore } from "vuex";
import maplibregl from 'maplibre-gl'
import { createVuetify } from 'vuetify'

const store = useStore();
const props =
    defineProps({
        clickedCoordinates: Array
    })

const commentModeEnabled = ref(false)
const emit = defineEmits(["addPopup"]);
onBeforeUpdate(() => {
    if (commentModeEnabled.value == true && props.clickedCoordinates.length > 0) {

        console.log("Display popup");
        const commentPopup = new maplibregl.Popup()
            .setLngLat(props.clickedCoordinates)
            .setHTML('<div id="vue-popup-content"></div>')
        emit("addPopup", commentPopup)

        const app = createApp(CommentPopupContent, {
            clickedCoordinates: props.clickedCoordinates,
            closePopup: commentPopup.remove
        })
        const vuetify = createVuetify()
        app.use(vuetify)
        app.use(store)
        app.mount('#vue-popup-content')
        //        commentModeEnabled.value = false
    }
})

const toggleCommentPopup = () => {
    commentModeEnabled.value = !commentModeEnabled.value;
}

const createComment = () => {
    if (store.state.contribution.commentToggle == true) {
        store.dispatch("contribution/createComment")
    }
}
const setLineDrawToggle = () => {
    store.commit("contribution/setLineDrawToggle")
}
const drawLine = () => {
    store.dispatch("contribution/drawLine")
}


</script>

<style scoped>
</style>