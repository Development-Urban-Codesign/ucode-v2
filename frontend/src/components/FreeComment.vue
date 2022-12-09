<template>
    <div class="comment-container">
        <v-btn id="comment-btn" size="large" height="48px" rounded="pill" color="primary"
            @touchstart="emit('getCenterOnMap')" @mousedown="emit('getCenterOnMap')" @click="createComment">
            Kommentieren
        </v-btn>
        <transition name="slide">
            <v-card v-show="props.showCommentDialog" id="card" elevation="20">
                <v-btn @click="cancelComment" icon="mdi-close" variant="plain" id="close-btn"/>
                <p class="font-weight-bold text-body-1 call-to-action" >Platziere deinen Kommentar</p>
                <div class="comment-text-area">
                    <v-textarea 
                        id="ta-input"
                        :class="commentText!==''?'show-send-btn':'hide-send-btn'"
                        variant="solo" 
                        label="Kommentar"
                        color="primary"
                        bg-color="rgb(248,248,248)"
                        no-resize 
                        :rows="(taLineCount>4?'4':taLineCount)" 
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
import { onMounted, reactive, ref, watch } from 'vue';
import type { FeatureCollection } from 'geojson';
import type internal from 'stream';
const store = useStore()
let commentText = ref<string>("")
let isFocused = ref<boolean>(false)
let allMarker = reactive<FeatureCollection>({ type: "FeatureCollection", features: [] })
let taLineCount = ref<number>(1)

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
/************************************************/
/*   handle Commenting Dialog for IOS, IPadOS   */
/************************************************/
const isIOSorIPadOS = () => {
    var userAgent = navigator.userAgent.toLowerCase();
    if(userAgent.match('iphone' || 'ipad')){
        return true
    } else {
        return false
    }
}

watch(commentText, function () {
    let input = document.getElementById('ta-input')
    let card = document.getElementById('card')

    var lines = commentText.value.split(/\r|\r\n|\n/);
    taLineCount.value = lines.length;

    input?.classList.add('ta-not-scroll');
    if(taLineCount.value>4){
        input?.classList.remove('ta-not-scroll');
        input?.classList.add('ta-scroll')
    }


    if(input && card && isIOSorIPadOS()){
        if(commentText.value !== ''){
            input.onblur = function() {
                card?.classList.remove('expand');
                card?.classList.remove('reduce');
            };
            input.onfocus = function() {
                card?.classList.remove('expand');
                card?.classList.remove('reduce');
            };
        } 
        if (commentText.value === '') {
            input.onblur = function() {
                card?.classList.remove('expand');
                card?.classList.add('reduce');
            };
            input.onfocus = function() {
                card?.classList.remove('reduce');
                card?.classList.add('expand');
            };
        }
       
    }
})

onMounted(() => {
    let input = document.getElementById('ta-input')
    let card = document.getElementById('card')

    input?.classList.add('ta-not-scroll');
    if(taLineCount.value>4){
        input?.classList.remove('ta-not-scroll')
        input?.classList.add('ta-scroll')
    }
    
    if(input && card && isIOSorIPadOS()){
        input.onblur = function() {
            card?.classList.remove('expand');
            card?.classList.add('reduce');
        };

        input.onfocus = function() {
            card?.classList.remove('reduce');
            card?.classList.add('expand');
        };
    } 
})
</script>

<style>
.ta-not-scroll{
    touch-action: none;
}

.ta-scroll{
    overscroll-behavior: none;
}

.expand{
    animation: expand-animation 0.25s ease-in-out 0s 1 forwards !important;
}

.reduce{
    animation: reduce-animation 0.25s ease-in-out 0s 1 forwards !important;
}

@keyframes expand-animation {
    0%   {padding-bottom: 0rem;}
    100% {padding-bottom: 296px;}
}
@keyframes reduce-animation {
    0%   {padding-bottom: 296px;}
    100% {padding-bottom: 0rem;}
}
</style>

<style scoped>
.comment-container {
    display: flex;
    touch-action: none;
    justify-content: center;
    width: 100%;
}

#comment-btn{
    touch-action: none;
    order: -1 !important;
    z-index: 998;
    position: absolute;
    bottom: 8rem
}
.v-card {
    position: relative;
    overflow: hidden !important;
    display: flex;
    flex-direction: column;
    width: 100%;
    z-index: 1005;
    border-radius: 12px 12px 0px 0px;
    margin-bottom: 0px;
    touch-action: none;
}

#close-btn{
    touch-action: none;
    position: relative; 
    margin: 0em 0em 0em auto;
}
.call-to-action{
    text-align: center;
    width: 100%;
    margin-bottom: 0px !important;
}
.comment-text-area{
    touch-action: none;
    display: flex;
    padding: 1em 0em 0em 1em;
}
#send-btn{
    position: relative;
    margin-top: auto;
    margin-bottom: 3em;
    margin-right: 2em;
    margin-left: -3.5rem;
}

.v-textarea{
     margin-right: 1em;
     z-index: 1;
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
    scrollbar-width: 0px;
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