<template>
    <div class="comment-container">
        <v-btn id="comment-btn" size="large" height="48px" rounded="pill" color="primary"
            @touchstart="emit('getCenterOnMap')" @mousedown="emit('getCenterOnMap')" @click="createComment">
            Kommentieren
        </v-btn>
        <transition name="slide">
            <v-card v-show="props.showCommentDialog" id="hass" elevation="20">
                <v-btn @click="cancelComment" icon="mdi-close" variant="plain" id="close-btn"/>
                <p class="font-weight-bold text-body-1 call-to-action" >Platziere deinen Kommentar</p>
                <div class="comment-text-area">
                    <v-textarea 
                        id="ta-input"
                        :class="commentText!==''?'show-send-btn':'hide-send-btn'"
                        variant="solo" 
                        placeholder="Kommentar"
                        color="primary" 
                        no-resize 
                        rows="4" 
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
let taLineCount = ref<number>(0)

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

const preventDefault = (e:Event) => {
    e.preventDefault();
}

watch(commentText, function () {
    let input = document.getElementById('ta-input')
    input?.classList.add('hass');

    // window.addEventListener('touchmove', preventDefault, { passive: false });
    var lines = commentText.value.split(/\r|\r\n|\n/);
    var count = lines.length;
    console.log(count);
    taLineCount.value = lines.length;
    if(lines.length>4){
        input?.classList.remove('hass');
    }
    // let input = document.getElementById('ta-input')
    // let body = document.body;

    // if(input && body && isIOSorIPadOS()){
    //     if(commentText.value !== ''){
    //         input.onblur = function() {
    //             body?.classList.remove('expand');
    //             body?.classList.remove('reduce');
    //             window.removeEventListener('touchmove', preventDefault, false);
    //         };
    //         input.onfocus = function() {
    //             body?.classList.remove('expand');
    //             body?.classList.remove('reduce');
    //             window.addEventListener('touchmove', preventDefault, { passive: false });
    //         };
    //     } 
    //     if (commentText.value === '') {
    //         input.onblur = function() {
    //             body?.classList.remove('expand');
    //             body?.classList.add('reduce');
    //             window.removeEventListener('touchmove', preventDefault, false);
    //         };
    //         input.onfocus = function() {
    //             body?.classList.remove('reduce');
    //             body?.classList.add('expand');
    //             window.addEventListener('touchmove', preventDefault, { passive: false });
    //         };
    //     }
       
    // }
})

onMounted(() => {
    let input = document.getElementById('ta-input')
    input?.classList.add('hass');
    if(taLineCount.value>4){
        input?.classList.remove('hass')
    }
    // window.addEventListener('touchmove', preventDefault, { passive: false });
    // let input = document.getElementById('ta-input')
    // let card = document.getElementById('hass');
    // let ta = document.getElementById('ta-input');
    // console.log(ta)
    // let body = document.body;
    // ta?.addEventListener('touchmove', preventDefault, { passive: false } );
    // card?.addEventListener('touchmove', preventDefault, { passive: false });
    // ta?.removeEventListener('touchmove', preventDefault, false );
    // if(input && body && isIOSorIPadOS()){
    //     input.onblur = function() {
    //         body?.classList.remove('expand');
    //         body?.classList.add('reduce');
    //         // window.removeEventListener('touchmove', preventDefault, false);
            
    //     };

    //     input.onfocus = function() {
    //         body?.classList.remove('reduce');
    //         body?.classList.add('expand');
    //         // window.addEventListener('touchmove', preventDefault, { passive: false });
    //     };
    // } 
})
</script>

<style>
.hass{
    touch-action: none;
}
.expand{
    animation: expand-animation 0.2s ease-in-out 0s 1 forwards !important;
}

.reduce{
    animation: reduce-animation 0.2s ease-in-out 0s 1 forwards !important;
}

@keyframes expand-animation {
    0%   {height: 100vh;}
    100% {height: 48vh;}
}
@keyframes reduce-animation {
    0%   {height: 48vh;}
    100% {height: 100vh;}
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