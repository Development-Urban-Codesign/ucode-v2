<template>
    <div class="comment-container">
        <v-btn id="comment-btn" size="large" rounded="pill" color="primary"
            @touchstart="emit('getCenterOnMap')" @mousedown="emit('getCenterOnMap')" @click="createComment">
            Kommentieren
        </v-btn>
        <transition name="slide">
            <v-card v-if="showCommentDialog" elevation="20">
                <v-btn @click="cancelComment" icon="mdi-close" variant="plain" id="close-btn"/>
                <p class="font-weight-bold text-body-1 call-to-action" >Platziere deinen Kommentar</p>
                <div className="comment-text-area">
                    <v-textarea 
                        :class="commentText!==''?'show-send-btn':'hide-send-btn'"
                        variant="solo" 
                        label="Kommentar" 
                        color="primary" 
                        no-resize 
                        rows="4" 
                        clearable
                        ref="input"
                        :modelValue="commentText"
                        @update:modelValue="text => commentText = text"
                    />
                    <v-btn @click="saveComment" color="primary" icon="mdi-send-outline" size="x-small" id="send-btn"/>
                </div>
            </v-card>
        </transition>
    </div>
</template>
<script lang="ts" setup>
import { useStore } from 'vuex';
import { HTTP } from '@/utils/http-common';
import { reactive, ref, watch } from 'vue';
import type { FeatureCollection } from 'geojson';
const store = useStore()
let commentText = ref<string>("")
let allMarker = reactive<FeatureCollection>({ type: "FeatureCollection", features: [] })

const props = defineProps({
    clickedCoordinates: Array<Number>,
    showCommentDialog: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(["addComment", "getCenterOnMap", "centerMapOnLocation", "deleteCommentLayer", "updateSourceData", "closeCommentDialog"])
function cancelComment() {
    store.commit('freecomment/setMoveComment', false)
    commentText.value = ""

    if (allMarker.features.length > 1) {
       
        allMarker.features.pop()
        
        emit('updateSourceData', 'ownComments', allMarker)
    }
    else {
        emit('deleteCommentLayer')
        allMarker.features.splice(allMarker.features.length - 1, 1)
    }
    emit('closeCommentDialog')
}

watch(()=> props.clickedCoordinates? props.clickedCoordinates : null, changePositionOfLastMarker)

function changePositionOfLastMarker(){
    if(!store.state.freecomment.moveComment){return}
    //console.log("changePosition")
    //@ts-ignore
    
    allMarker.features[allMarker.features.length-1].geometry.coordinates = props.clickedCoordinates
    emit('updateSourceData', 'ownComments', allMarker)
}
function createComment() {
    store.commit('freecomment/setMoveComment', true)
    let marker = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: props.clickedCoordinates
        }
    }
    //@ts-ignore
    allMarker.features.push(marker)
    

    let mapsource = {
        id: "ownComments",
        geojson: {
            "type": "geojson",
            "data": allMarker
        }
    }
    let ownCommentLayer = {
        'id': "ownComments",
        'type': 'symbol',
        'source': "ownComments",
        'layout': {
            'icon-image': 'comment.png', // reference the image
            'icon-size': 0.25,
            'icon-offset': [130, 25],
            'icon-anchor': "bottom",
            'icon-allow-overlap': true,
            // 'icon-ignore-placement': true
        },
        'paint': {
            // 'fadeDuration': 0
        }
    }
    emit('addComment', mapsource, ownCommentLayer)
}

const saveComment = () => {
    const submitComment = () => {
        HTTP
            .post('add-comment', {
                projectId: store.state.aoi.projectSpecification.project_id,
                comment: commentText.value,
                position: props.clickedCoordinates,
                userId: store.state.aoi.userId
            })
    }
    submitComment()
    commentText.value = ""
    store.commit('freecomment/setMoveComment', false)

    emit('closeCommentDialog')
}
</script>

<style scoped>
.comment-container {
    display: flex;
    justify-content: center;
    width: 100%;
}

#comment-btn{
    order: -1 !important;
    z-index: 998;
    margin-bottom: 0.5em;
    position: absolute;
    bottom: calc(0.5em + 56px + 43px);
}
.v-card {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    z-index: 1005;
    border-radius: 12px 12px 0px 0px;
    margin-bottom: 0px;
}

#close-btn{
    position: relative; 
    margin: 0em 0em 0em auto;
}
.call-to-action{
    text-align: center;
    width: 100%;
    margin-bottom: 0px !important;
}
.comment-text-area{
    display: flex;
    padding: 1em 0em 0em 1em;
}

.v-textarea{
    margin-right: 1em;
    border-radius: 1rem !important;
    z-index: 1;
}
#send-btn{
    position: absolute;
    bottom: 3em;
    right: 2em;
}

/* Animation */
.slide-enter-active{
    margin-bottom: -25em;
    transition: margin-bottom 0.4s ease-out;
}

.slide-enter-to{
    margin-bottom: 0px;
}

 .slide-leave-active {
    margin-bottom: 0px;
    transition: margin-bottom 0.3s ease-in;
}

.slide-leave-to{
    margin-bottom: -25em;
} 

.show-send-btn{
    animation: slide-left 0.2s ease-in-out 0s 1 forwards;
}

@keyframes slide-left {
    0%   {margin-right: 1em;}
    100% {margin-right: 4em;}
}

.hide-send-btn{
    animation: slide-right 0.2s ease-in-out 0s 1 forwards;
}

@keyframes slide-right {
    0%   {margin-right: 4em;}
    100% {margin-right: 1em;}
}

</style>