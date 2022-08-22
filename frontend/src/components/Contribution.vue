<template>
    
    <v-col cols="1" sm="1" style="position:absolute; left: 0; top:0; z-index:999">
        <v-btn rounded="pill" color="secondary" @click="toggleCommentPopup">
            Comment
        </v-btn>
        <v-btn rounded="pill" color="primary" @click="setLineDrawToggle(); drawLine()" class="mt-2">
            Draw Line
        </v-btn>
    </v-col>

   

</template>

<script setup>
import CommentPopupContent from '@/components/CommentPopupContent.vue'
import LinePopupContent from '@/components/LinePopupContent.vue'
import { ref, reactive, createApp, onBeforeUpdate } from "vue"
import { useStore } from "vuex";
import maplibregl from 'maplibre-gl'
import { createVuetify } from 'vuetify'
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import {PathLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';

const store = useStore();
const props =
    defineProps({
        clickedCoordinates: Array,
        lineDrawCreated: Number
    })

const commentModeEnabled = ref(false)
const lineDrawToggle =  ref(false)
let draw = reactive (null)
let drawnLineGeometry = reactive (null)
let drawnPathlayer = reactive (null)
let drawnPathlayerId = ref (null)


const emit = defineEmits(["addPopup", "addDrawControl", "addDrawnLine", "addLinePopup", "test"]);
//const emit = defineEmits(["addDrawControl"]);

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
        commentModeEnabled.value = false
    }
    if (lineDrawToggle.value == true && props.lineDrawCreated==1){
        drawnPathlayer=null
        drawnLineGeometry = draw.getAll()
        drawnPathlayerId = 'id' + (new Date()).getTime();
        drawnPathlayer = new MapboxLayer({
            id:drawnPathlayerId,
            type: PathLayer,
            data: drawnLineGeometry.features,
            pickable: true,
            widthScale: 1,
            widthMinPixels: 2,
            getPath: d => d.geometry.coordinates,
            getColor: [150,150,150,255],
            getWidth: 1
        });
        console.log(drawnPathlayer)
        const linePopup = new maplibregl.Popup({ closeOnClick: false, closeButton: false, })
            .setLngLat([drawnLineGeometry?.features[0]?.geometry?.coordinates?.slice(-1)[0][0], drawnLineGeometry?.features[0]?.geometry?.coordinates?.slice(-1)[0][1]])
            .setHTML('<div id="draw-line-popup-content">fff</div>')
        
        emit("addDrawnLine", drawnLineGeometry, drawnPathlayerId, drawnPathlayer, linePopup)
        
        document.getElementsByClassName('mapboxgl-popup-content maplibregl-popup-content')[0].style.width="400px"

        const app = createApp(LinePopupContent, {
            
            drawnLineGeometry: drawnLineGeometry,
            changeColor:(r,g,b)=>{
                drawnPathlayer.setProps({getColor: [r,g,b,255]})
            },
            changeWidth:(width)=>{
                drawnPathlayer.setProps({getWidth: width})
            },
            removeDrawnLineAction:()=>{
                emit("removeDrawnLine", draw, drawnPathlayerId)
            },
            removeDrawControlAction:()=>{
                emit("removeDrawControl", draw, drawnPathlayerId)
            },
            closeLinePopup: ()=>{
                linePopup.remove(); drawnLineGeometry=null; lineDrawToggle.value = false; drawnPathlayer = null;

            },
        })
        
        const vuetify = createVuetify()
        app.use(vuetify)
        app.use(store)
        app.mount('#draw-line-popup-content')
        lineDrawToggle.value = false
        
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
     lineDrawToggle.value=true
     if (lineDrawToggle.value == true ){
        draw = null
        if (draw==null){
            draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    line_string: true,
                    trash: true,
                },
                defaultMode: 'draw_line_string'
            });
            emit("addDrawControl", draw)
        }
    }
}
const drawLine = () => {
    //store.dispatch("contribution/drawLine")
    
}



</script>

<style scoped>
</style>