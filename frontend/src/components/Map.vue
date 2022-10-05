<template>
  <div class="map-wrap" ref="mapContainer">
    <div class="map" id="map">
      <!--Show this only when http://localhost:8080/?devmode=true-->
      <v-row v-if="store.state.aoi.isDevmode" style="position: absolute; right: 20px; top: 20px; z-index: 999">
        <v-btn color="success" class="ml-2" @click="getCommentData">
          Show comments
        </v-btn>
        <v-btn color="error" class="ml-2" @click="addThreejsShape">
          Threejs
        </v-btn>
        <v-btn color="success" class="ml-2" @click="addDeckglShape">
          Deckgl
        </v-btn>
      </v-row>
      <Loadingscreen v-if="!store.state.aoi.mapIsPopulated && !store.state.aoi.isDevmode"/>
      <AOI @addLayer="addLayerToMap" @addImage="addImageToMap" />
      <Quests />
      <Contribution @addPopup="addPopupToMap" @addDrawControl="addDrawControl" @addDrawnLine="addDrawnLine" @removeDrawnLine="removeDrawnLine" @removeDrawControl="removeDrawControl" :clickedCoordinates="mapClicks.clickedCoordinates" :lineDrawCreated="lineDrawCreated" />
      <Comment @removePulseLayer="removePulseLayerFromMap"/>
      
    </div>
  </div>
</template>

<script setup>
import { MapboxLayer } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { Map } from "maplibre-gl";
import { onMounted, onUnmounted, reactive, shallowRef, ref } from "vue";
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";
import { TreeModel } from "../utils/TreeModel";
import AOI from "./AOI.vue";
import Contribution from "./Contribution.vue";
import {getCommentsFromDB} from "../service/backend.service";
import Comment from "./Comment.vue";
import { pulseLayer } from "../utils/pulseLayer";
import Quests from "./Quests.vue";
import Loadingscreen from "./Loadingscreen.vue";



const store = useStore();

const mapContainer = shallowRef(null);
let map = {};
const mapClicks = reactive({ clickedCoordinates: [] })
let lineDrawCreated = ref(0)


let unsubscribeFromStore = () => { };

onUnmounted(() => {
  unsubscribeFromStore()
})

onMounted(() => {
  map = new Map({
    container: mapContainer.value,
    style: store.state.map.style,
    center: [store.state.map.center.lng, store.state.map.center.lat],
    zoom: store.state.map.zoom,
    minZoom: store.state.map.minZoom,
    maxZoom: store.state.map.maxZoom,
    maxPitch: store.state.map.maxPitch,
  });
  map.on("load", function () {
    HTTP.get("").then((response) => {
      // console.log(response);
    })
    
    //  getCommentData()
    
  });
  map.on('click', function (mapClick) {
    mapClicks.clickedCoordinates = [mapClick.lngLat.lng, mapClick.lngLat.lat]

    if(store.state.comment.toggle){
      addLayerToMap(pulseLayer(
        store.state.pulse.pulseCoordinates.geometry.coordinates,
        store.state.pulse.pulseAnimationActivation
      ))
    }
   
  });

  map.on('draw.create', ()=> {
      lineDrawCreated.value = 1
  })

 


  unsubscribeFromStore = store.subscribe((mutation, state) => {
    if (mutation.type === "map/addLayer") {
      state.map.layers?.slice(-1).map(addLayerToMap)
    }
    if (mutation.type === "map/addSource") {
      state.map.sources?.slice(-1).map(addSourceToMap)
    }
  });
});



// threejs layer
const addThreejsShape = () => {
  addLayerToMap(TreeModel(13.74647, 51.068646, 100));
}
const addLayerToMap = (layer) => {
  const addedlayer = map.getLayer(layer.id)
  if(typeof addedlayer !== 'undefined' ){
    removeLayerFromMap(layer.id)
  }

  if (!layer) return;
  if (layer.paint) {
    if (layer.paint["fill-pattern"]) {
      addImageToMap(layer.paint["fill-pattern"]);
    }
  }
  map?.addLayer(layer);
  
  const buildinglayer = map.getLayer("overpass_buildings")
  const greenerylayer = map.getLayer("overpass_greenery")
  const commentlayer = map.getLayer("comments")
  const drivinglanelayer = map.getLayer("driving_lane_polygon")
  const drivinglane = map.getLayer("driving_lane")
  const treeLayer = map.getLayer("trees")
  if(typeof buildinglayer !== 'undefined' && typeof greenerylayer !== 'undefined'){
    map?.moveLayer("overpass_greenery", "overpass_buildings" )
  }
  if(typeof commenlayer !== 'undefined' && typeof greenerylayer !== 'undefined'){
    map?.moveLayer("overpass_greenery", "comments" )
  }
  if(typeof drivinglanelayer !== 'undefined' && typeof commentlayer !== 'undefined'){
    map?.moveLayer("driving_lane_polygon", "comments")
  }
  if(typeof drivinglane !== 'undefined' && typeof commentlayer !== 'undefined'){
    map?.moveLayer("driving_lane", "comments")
  }
  if(typeof drivinglanelayer !== 'undefined' && typeof buildinglayer !== 'undefined'){
    map?.moveLayer("driving_lane_polygon", "overpass_buildings")
  }
  if(typeof drivinglane !== 'undefined' && typeof buildinglayer !== 'undefined'){
    map?.moveLayer("driving_lane", "overpass_buildings")
  }

  if(typeof greenerylayer !== 'undefined' && typeof treeLayer !== 'undefined'){
    map?.moveLayer("overpass_greenery", "trees")
  }
  if(typeof drivinglanelayer !== 'undefined' && typeof treeLayer !== 'undefined'){
    map?.moveLayer("driving_lane_polygon", "trees")
  }
  if(typeof drivinglane !== 'undefined' && typeof treeLayer !== 'undefined'){
    map?.moveLayer("driving_lane", "trees")
}

   
};

const removeLayerFromMap = (layerId) => {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

const addSourceToMap = (source) => {
  // console.log(source)
  if (!source) return;
  if (!map) return;
  //TODO extract this as a function parameter
  let sourceId = source.id;
  /*if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
    removeLayerFromMap(sourceId)
  }*/

  map.addSource(sourceId, source.geojson);
};
const addImageToMap = (ImgUrl) => {
  if (!ImgUrl) return;
  map?.loadImage(ImgUrl, (error, image) => {
    if (error) throw error;
    map?.addImage(ImgUrl, image);
  }); 
};

const getCommentData = async () => {
  const commentLayer = await getCommentsFromDB(store.state.aoi.projectId)
  addLayerToMap(commentLayer)
};
// deckgl layder
const addDeckglShape = () => {
  const myDeckLayer = new MapboxLayer({
    id: "hexagon2D",
    type: ScenegraphLayer,
    data: [13.755453, 51.067814],
    pickable: true,
    scenegraph:
      "./GenericNewTree.glb",
    getPosition: [13.755453, 51.067814],
    getOrientation: (d) => [0, 0, 90],
    sizeScale: 50,
    _lighting: "pbr",
  });
  addLayerToMap(myDeckLayer);
};

const addPopupToMap = (popup) => {
  popup?.addTo(map)
}

const addDrawControl = (draw)=>{
  map?.addControl(draw, 'bottom-right');
}

const addDrawnLine = (drawnLineGeometry, drawnPathlayerId, drawnPathlayer, linePopup)=>{
  addLayerToMap(drawnPathlayer)    
  linePopup?.addTo(map)
      
}

const removeDrawnLine = (draw, drawnPathlayerId)=>{

  removeLayerFromMap(drawnPathlayerId)
}
const removeDrawControl= (draw, drawnPathlayerId)=>{
  lineDrawCreated.value = 0
  map.removeControl(draw)
}

const removePulseLayerFromMap= (layerid)=>{
  removeLayerFromMap(layerid)
  cancelAnimationFrame(store.state.pulse.pulseAnimationActivation)
  
}


onUnmounted(() => {
  map?.remove();
});
</script>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map {
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: darkgray;
  margin: auto;
}


</style>