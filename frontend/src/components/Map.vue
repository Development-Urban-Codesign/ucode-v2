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
      <AOI @addLayer="addLayerToMap" @addImage="addImageToMap" />
      <PlanningIdeas v-if="mapStyleLoaded" @activateSelectedPlanningIdea="activateSelectedPlanningIdeaInMap" @navigateToPlanningIdea="navigateToPlanningIdea" />

      <Quests />
      <Contribution @addPopup="addPopupToMap" @addDrawControl="addDrawControl" @addDrawnLine="addDrawnLine"
        @removeDrawnLine="removeDrawnLine" @removeDrawControl="removeDrawControl"
        :clickedCoordinates="mapClicks.clickedCoordinates" :lineDrawCreated="lineDrawCreated" />
      <Comment @removePulseLayer="removePulseLayerFromMap" />

    </div>
  </div>
</template>

<script setup>
import { MapboxLayer } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { Map } from "maplibre-gl";
import { onMounted, onUnmounted, reactive, ref, shallowRef } from "vue";
import { useStore } from "vuex";
import { getCommentsFromDB } from "../service/backend.service";
import { HTTP } from "../utils/http-common";
import { pulseLayer } from "../utils/pulseLayer";
import { TreeModel } from "../utils/TreeModel";
import AOI from "./AOI.vue";
import Comment from "./Comment.vue";
import Contribution from "./Contribution.vue";
import PlanningIdeas from "./PlanningIdeas.vue";
import Quests from "./Quests.vue";
import * as turf from '@turf/turf'


const store = useStore();

const mapContainer = shallowRef(null);
let map = {};
const mapClicks = reactive({ clickedCoordinates: [] })
let lineDrawCreated = ref(0)
let mapStyleLoaded = ref(false)

let unsubscribeFromStore = () => { };

onUnmounted(() => {
  unsubscribeFromStore()
})

onMounted(() => {
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // We listen to the resize event
  window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
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
    mapStyleLoaded.value = true
    unsubscribeFromStore = store.subscribe((mutation, state) => {
      if (mutation.type === "map/addLayer") {
        state.map.layers?.slice(-1).map(addLayerToMap)
      }
      if (mutation.type === "map/addSource") {
        state.map.sources?.slice(-1).map(addSourceToMap)
      }
    });
    const projectBBOX = [
      store.state.aoi.projectSpecification.bbox.xmin,
      store.state.aoi.projectSpecification.bbox.ymin,
      store.state.aoi.projectSpecification.bbox.xmax,
      store.state.aoi.projectSpecification.bbox.ymax
    ]
    map.fitBounds(projectBBOX);
    
    HTTP.get("").then((response) => {
      // console.log(response);
    })

    //  getCommentData()

  });
  map.on('click', function (mapClick) {
    mapClicks.clickedCoordinates = [mapClick.lngLat.lng, mapClick.lngLat.lat]

    if (store.state.comment.toggle) {
      addLayerToMap(pulseLayer(
        store.state.pulse.pulseCoordinates.geometry.coordinates,
        store.state.pulse.pulseAnimationActivation
      ))
    }

  });

  map.on('draw.create', () => {
    lineDrawCreated.value = 1
  })



});



// threejs layer
const addThreejsShape = () => {
  addLayerToMap(TreeModel(13.74647, 51.068646, 100));
}
const addLayerToMap = (layer) => {
  const addedlayer = map.getLayer(layer.id)
  if (typeof addedlayer !== 'undefined') {
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
  const routesLayer = map.getLayer("routes")
  const routesSymbolLayer = map.getLayer("routes-symbols")
  if (typeof buildinglayer !== 'undefined' && typeof greenerylayer !== 'undefined') {
    map?.moveLayer("overpass_greenery", "overpass_buildings")
  }
  if (typeof commenlayer !== 'undefined' && typeof greenerylayer !== 'undefined') {
    map?.moveLayer("overpass_greenery", "comments")
  }
  if (typeof drivinglanelayer !== 'undefined' && typeof commentlayer !== 'undefined') {
    map?.moveLayer("driving_lane_polygon", "comments")
  }
  if (typeof drivinglane !== 'undefined' && typeof commentlayer !== 'undefined') {
    map?.moveLayer("driving_lane", "comments")
  }
  if (typeof drivinglanelayer !== 'undefined' && typeof buildinglayer !== 'undefined') {
    map?.moveLayer("overpass_buildings", "driving_lane_polygon")
  }
  if (typeof drivinglane !== 'undefined' && typeof buildinglayer !== 'undefined') {
    map?.moveLayer("overpass_buildings", "driving_lane")
  }

  if (typeof greenerylayer !== 'undefined' && typeof treeLayer !== 'undefined') {
    map?.moveLayer("overpass_greenery", "trees")
  }
  if (typeof drivinglanelayer !== 'undefined' && typeof treeLayer !== 'undefined') {
    map?.moveLayer("driving_lane_polygon", "trees")
  }
  if (typeof drivinglane !== 'undefined' && typeof treeLayer !== 'undefined') {
    map?.moveLayer("driving_lane", "trees")
  }
  if (typeof routesLayer !== 'undefined' && typeof treeLayer !== 'undefined') {
    map?.moveLayer("routes", "trees")
  }
  if (typeof routesSymbolLayer !== 'undefined' && typeof treeLayer !== 'undefined') {
    map?.moveLayer("routes-symbols", "trees")
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

const addDrawControl = (draw) => {
  map?.addControl(draw, 'bottom-right');
}

const addDrawnLine = (drawnLineGeometry, drawnPathlayerId, drawnPathlayer, linePopup) => {
  addLayerToMap(drawnPathlayer)
  linePopup?.addTo(map)

}

const removeDrawnLine = (draw, drawnPathlayerId) => {

  removeLayerFromMap(drawnPathlayerId)
}
const removeDrawControl = (draw, drawnPathlayerId) => {
  lineDrawCreated.value = 0
  map.removeControl(draw)
}

const removePulseLayerFromMap = (layerid) => {
  removeLayerFromMap(layerid)
  cancelAnimationFrame(store.state.pulse.pulseAnimationActivation)

}

const activateSelectedPlanningIdeaInMap = (selectedFeature)=>{

  let bounds = turf.bbox(selectedFeature);
  map.fitBounds(bounds, {padding: 20});

  if (selectedFeature.type== 'FeatureCollection'){

      map.setPaintProperty ('routes', 'line-color',  ['get', 'color']);
  } else {

    map.setPaintProperty(
      'routes', 
      'line-color', 
      ['match', ['get', 'id'], selectedFeature.properties.id, selectedFeature.properties.color , 'rgba(0,0,0,0.4)' /*['get', 'color']*/],
      
    )

  }
  
}


const navigateToPlanningIdea = (planningIdeaBBOX) => {

  setTimeout(()=>{
    map.fitBounds(planningIdeaBBOX,{
      pitch:60,
      duration: 3000,
      curve: 4,
    });
  }, 2000);
  
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
  height: calc(var(--vh, 1vh) * 100);
}

.map {
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: darkgray;
  margin: auto;
}



</style>