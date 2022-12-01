<template>
    <div class="map-wrap" ref="mapContainer">
      <div class="map" id="map">
        <v-row v-if="devMode" style="position: absolute; right: 20px; top: 20px; z-index: 999">
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
        <AOI v-if="mapStyleLoaded" @addLayer="addLayerToMap" @addImage="addImageToMap" @triggerRepaint="triggerRepaint" />
        <Quests v-if="devMode"/>
        <PlanningIdeas v-if="mapStyleLoaded" @activateSelectedPlanningIdea="activateSelectedPlanningIdeaInMap"
            @navigateToPlanningIdea="navigateToPlanningIdea" />
        <FreeComment :showCommentDialog="showCommentDialog" @deleteCommentLayer="deleteCommentLayer" @centerMapOnLocation="centerMapOnLocation"
          @addComment="addCommentToMap" @getCenterOnMap="getMapCenter"
          :clickedCoordinates="commentClicks.commentCoordinates" @updateSourceData="updateSourceData" @closeCommentDialog="closeCommentDialog"/>
        <CommentView :show="tabIndex=='discussion'"/>
        <BottomNavigation @tabIndexChanged="switchView" :tabIndex="tabIndex"/>
        <Contribution @addPopup="addPopupToMap" @addDrawControl="addDrawControl" @addDrawnLine="addDrawnLine"
          @removeDrawnLine="removeDrawnLine" @removeDrawControl="removeDrawControl"
          :clickedCoordinates="mapClicks.clickedCoordinates" :lineDrawCreated="lineDrawCreated" />
        <Comment @removePulseLayer="removePulseLayerFromMap" />
      </div>
    </div>
</template>


<script lang="ts" setup>
import AOI from "@/components/AOI.vue";
import Comment from "@/components/Comment.vue";
import Contribution from "@/components/Contribution.vue";
import PlanningIdeas from "@/components/PlanningIdeas.vue";
import Quests from "@/components/Quests.vue";
import FreeComment from "@/components/FreeComment.vue";
import BottomNavigation from "@/components/BottomNavigation.vue";
import CommentView from "@/components/CommentView.vue";
import { getCommentsFromDB } from "@/service/backend.service";
import type { ProjectSpecification } from "@/store/modules/aoi";
import { HTTP } from "@/utils/http-common";
import { pulseLayer } from "@/utils/pulseLayer";
import { MapboxLayer } from "@deck.gl/mapbox/typed";
import { ScenegraphLayer } from "@deck.gl/mesh-layers/typed";
import * as turf from '@turf/turf';
import { Map, type CustomLayerInterface, type Feature, type IControl, type LayerSpecification, type LngLatBoundsLike, type LngLatLike, type Popup } from "maplibre-gl";
import { computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from "vue";
import { useStore } from "vuex";
import { deckLightingEffect } from "@/utils/deckLighting";


const store = useStore();

const devMode = computed(() => store.getters["ui/devMode"]);

const mapContainer = shallowRef(null);
let map: Map = {} as Map;
const mapClicks = reactive({ clickedCoordinates: [] })
const commentClicks = reactive<{ commentCoordinates: number[] }>({ commentCoordinates: [] })
let lineDrawCreated = ref(0)
let mapStyleLoaded = ref(false)
let tabIndex = ref("planning")
let showCommentDialog = ref(false)
//let activeMarker = reactive<any>({});



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
    container: mapContainer.value ?? "",
    style: store.state.map.style,
    center: [store.state.map.center.lng, store.state.map.center.lat],
    zoom: store.state.map.zoom,
    minZoom: store.state.map.minZoom,
    maxZoom: store.state.map.maxZoom,
    maxPitch: store.state.map.maxPitch,
    attributionControl: false
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

    const projectSpecification: ProjectSpecification = store.state.aoi.projectSpecification;

    map.fitBounds([projectSpecification.bbox.xmin,
    projectSpecification.bbox.ymin,
    projectSpecification.bbox.xmax,
    projectSpecification.bbox.ymax]);

    HTTP.get("").then((response) => {
      // console.log(response);
    })

    //  getCommentData()

  });
  map.on('click', function (mapClick) {
    // @ts-ignore
    mapClicks.clickedCoordinates = [mapClick.lngLat.lng, mapClick.lngLat.lat]

    if (store.state.comment.toggle) {
      //@ts-ignore
      addLayerToMap(pulseLayer(store.state.pulse.pulseCoordinates.geometry.coordinates))
    }

  });

  map.on('draw.create', () => {
    lineDrawCreated.value = 1
  })


  map.on('mousedown', 'ownComments', (e) => {
    // Prevent the default map drag behavior.
    if (!store.state.freecomment.moveComment) {
      return
    }
    e.preventDefault();
    map.on('mousemove', onMoveComment);
    map.once('mouseup', onUp);
  });

  map.on('touchstart', 'ownComments', (e) => {
    if (e.points.length !== 1) return;
    if (!store.state.freecomment.moveComment) {
      return
    }
    e.preventDefault();
    map.on('touchmove', onMoveComment);
    map.once('touchend', onUp);

  })
});
function updateSourceData(sourceId: string, data: any) {
  map.getSource(sourceId)?.setData(data)
}
function onUp() {
  map.off('mousemove', onMoveComment);
  map.off('touchmove', onMoveComment);
}
function onMoveComment(e: { lngLat: { lng: number; lat: number; }; }) { commentClicks.commentCoordinates = [e.lngLat.lng, e.lngLat.lat]; }

function centerMapOnLocation(location: LngLatLike) { map.panTo(location); }

function getMapCenter() { commentClicks.commentCoordinates = ([map.getCenter().lng, map.getCenter().lat]); }

function deleteCommentLayer() {
  map.removeLayer('ownComments')
  map.removeSource('ownComments')
  map.removeImage('comment.png')
}
const triggerRepaint = () => {
  map.triggerRepaint()
}
// threejs layer
const addThreejsShape = () => {
  //TODO type treemodel 
  // @ts-ignore
  addLayerToMap(TreeModel(13.74647, 51.068646, 100));
  map.triggerRepaint()
}
function deleteOwnComment() {
  map.removeLayer('ownComments')
  map.removeSource('ownComments')
  map.removeImage('comment.png')
}

const addCommentToMap = (source: any, layer: any) => {

  showCommentDialog.value = true

  // if (map.getSource(source.id) !== undefined) {
  //   // console.log("already in use")
  //   addSourceToMap(source)
  //   //@ts-ignore TODO Dobo help
  //   activeMarker = map.getSource('ownComments')._data;
  //   return
  // }
  addSourceToMap(source)
  map?.loadImage('comment.png', (error, image) => {
    if (error) throw error;
    map?.addImage('comment.png', image!);
    addLayerToMap(layer)
  });
  //@ts-ignore TODO Dobo help
  //activeMarker = map.getSource('ownComments')._data;
}

store.commit("map/addLayer", {
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
})


const addLayerToMap = (layer: LayerSpecification | CustomLayerInterface, beforeLayer?: string) => {
  // console.log(layer.id)
  const addedlayer = map.getLayer(layer.id)
  if (typeof addedlayer !== 'undefined') {
    removeLayerFromMap(layer.id)
  }

  if (!layer) return;
  // @ts-ignore
  if (layer.paint) {
    // @ts-ignore
    if (layer.paint["fill-pattern"]) {
      // @ts-ignore
      addImageToMap(layer.paint["fill-pattern"]);
    }
  }
  map?.addLayer(layer,beforeLayer? beforeLayer: "");
  const layerHirarchy: any[] = []// = reactive<[{layer: any, orderId: Number}]>([{}])

  const buildinglayer = map.getLayer("overpass_buildings")
  // @ts-ignore
  buildinglayer?.implementation?.deck.setProps({
    effects: [deckLightingEffect]
  });

  if (typeof buildinglayer !== 'undefined') {
    layerHirarchy.push({ layer: buildinglayer, orderId: 99 })
  }
  const greenerylayer = map.getLayer("overpass_greenery")
  if (typeof greenerylayer !== 'undefined') {
    layerHirarchy.push({ layer: greenerylayer, orderId: 10 })
  }
  const commentlayer = map.getLayer("comments")
  if (typeof commentlayer !== 'undefined') {
    layerHirarchy.push({ layer: commentlayer, orderId: 90 })
  }
  const drivinglanelayer = map.getLayer("driving_lane_polygon")
  if (typeof drivinglanelayer !== 'undefined') {
    layerHirarchy.push({ layer: drivinglanelayer, orderId: 60 })
  }
  const drivinglane = map.getLayer("driving_lane")
  if (typeof drivinglane !== 'undefined') {
    layerHirarchy.push({ layer: drivinglane, orderId: 70 })
  }
  const treeLayer = map.getLayer("trees")
  if (typeof treeLayer !== 'undefined') {
    layerHirarchy.push({ layer: treeLayer, orderId: 80 })
  }
  const treeLayer3js = map.getLayer("TreeVariants/Tree_02.glb")
  if (typeof treeLayer3js !== 'undefined') {
    layerHirarchy.push({ layer: treeLayer3js, orderId: 80 })
  }
  const routesLayer = map.getLayer("routes")
  if (typeof routesLayer !== 'undefined') {
    layerHirarchy.push({ layer: routesLayer, orderId: 1 })
  }
  const routesSymbolLayer = map.getLayer("routes-symbols")
  if (typeof routesSymbolLayer !== 'undefined') {
    layerHirarchy.push({ layer: routesSymbolLayer, orderId: 76 })
  }
  const ownCommentLayer = map.getLayer("ownComments")
  if (typeof ownCommentLayer !== 'undefined') {
    layerHirarchy.push({ layer: ownCommentLayer, orderId: 100 })
  }
  const ThreeJsScene3d = map.getLayer("threeJsScene3d")
  if (typeof ThreeJsScene3d !== 'undefined') {
    layerHirarchy.push({ layer: ThreeJsScene3d, orderId:  2})
  }
  const ThreeJsSceneFlat = map.getLayer("threeJsSceneFlat")
  if (typeof ThreeJsSceneFlat !== 'undefined') {
    layerHirarchy.push({ layer: ThreeJsSceneFlat, orderId: 0 })
  }

  // const TramLayer = map.getLayer("tram_line")
  // if (typeof TramLayer !== 'undefined') {
  //   layerHirarchy.push({ layer: TramLayer, orderId: 90 })
  // }




  // for (let index = 0; index < layerHirarchy.length; index++) {
  //   const x = layerHirarchy[index];
  //     for (let index = 0; index < layerHirarchy.length; index++) {
  //       const y = layerHirarchy[index];
  //        if(x.layer !== y.layer && x.orderId>y.orderId){
  //          map.moveLayer(y.layer.id,x.layer.id)
  //          console.log("move layer " + x.layer.id + " over " +y.layer.id)
  //         //  console.log("map.moveLayer("+y.layer.id+","+x.layer.id+")")
  //        }
  //   }
  // }

  // if (typeof buildinglayer !== 'undefined' && typeof greenerylayer !== 'undefined') {
  //   map?.moveLayer("overpass_greenery", "overpass_buildings")
  // }
  // if (typeof commentlayer !== 'undefined' && typeof greenerylayer !== 'undefined') {
  //   map?.moveLayer("overpass_greenery", "comments")
  // }
  // if (typeof drivinglanelayer !== 'undefined' && typeof commentlayer !== 'undefined') {
  //   map?.moveLayer("driving_lane_polygon", "comments")
  // }
  // if (typeof drivinglane !== 'undefined' && typeof commentlayer !== 'undefined') {
  //   map?.moveLayer("driving_lane", "comments")
  // }
  // if (typeof drivinglanelayer !== 'undefined' && typeof buildinglayer !== 'undefined') {
  //   map?.moveLayer("overpass_buildings", "driving_lane_polygon")
  // }
  // if (typeof drivinglane !== 'undefined' && typeof buildinglayer !== 'undefined') {
  //   map?.moveLayer("overpass_buildings", "driving_lane")
  // }
  // if (typeof greenerylayer !== 'undefined' && typeof treeLayer !== 'undefined') {
  //   map?.moveLayer("overpass_greenery", "trees")
  // }
  // if (typeof drivinglanelayer !== 'undefined' && typeof treeLayer !== 'undefined') {
  //   map?.moveLayer("driving_lane_polygon", "trees")
  // }
  // if (typeof drivinglane !== 'undefined' && typeof treeLayer !== 'undefined') {
  //   map?.moveLayer("driving_lane", "trees")
  // }
  // if (typeof routesLayer !== 'undefined' && typeof treeLayer !== 'undefined') {
  //   map?.moveLayer("routes", "trees")
  // }
  // if (typeof routesSymbolLayer !== 'undefined' && typeof treeLayer !== 'undefined') {
  //   map?.moveLayer("routes-symbols", "trees")
  // }
  // if(typeof ownCommentLayer !== 'undefined'){
  //   map.moveLayer('ownComments')
  // }


};

const removeLayerFromMap = (layerId: string) => {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

const addSourceToMap = (source: { id: string, geojson: any }) => {
  // console.log(source)
  if (!source) return;
  if (!map) return;
  //TODO extract this as a function parameter
  let sourceId = source.id;
  /*if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
    removeLayerFromMap(sourceId)
  }*/

  if (map.getSource(sourceId) !== undefined) {
    let data = source.geojson.data
    //@ts-ignore
    map.getSource(sourceId).setData(data)
  }
  else {
    map.addSource(sourceId, source.geojson);
  }

};

const addImageToMap = (imgUrl: string) => {
  if (!imgUrl) return;
  map?.loadImage(imgUrl, (error, image) => {
    if (error) throw error;
    map?.addImage(imgUrl, image!);
  });
};

const getCommentData = async () => {
  const commentLayer = await getCommentsFromDB(store.state.aoi.projectId);
  addLayerToMap(commentLayer as unknown as CustomLayerInterface)
};
// deckgl layder
const addDeckglShape = () => {
  const myDeckLayer = new MapboxLayer({
    id: "hexagon2D",
    // @ts-ignore
    type: ScenegraphLayer,
    data: [13.755453, 51.067814],
    pickable: true,
    scenegraph:
      "./GenericNewTree.glb",
    getPosition: [13.755453, 51.067814],
    getOrientation: () => [0, 0, 90],
    sizeScale: 50,
    _lighting: "pbr",
  }) as unknown as CustomLayerInterface;
  addLayerToMap(myDeckLayer);
};

const addPopupToMap = (popup: Popup) => {
  popup?.addTo(map)
}

const addDrawControl = (draw: IControl) => {
  map?.addControl(draw, 'bottom-right');
}

const addDrawnLine = (drawnPathlayer: CustomLayerInterface, linePopup: Popup) => {
  addLayerToMap(drawnPathlayer)
  linePopup?.addTo(map)
}

const removeDrawnLine = (draw: unknown, drawnPathlayerId: string) => {
  removeLayerFromMap(drawnPathlayerId)
}

const removeDrawControl = (draw: IControl, drawnPathlayerId: string) => {
  lineDrawCreated.value = 0
  map.removeControl(draw)
}

const removePulseLayerFromMap = (layerid: string) => {
  removeLayerFromMap(layerid)
  cancelAnimationFrame(store.state.pulse.pulseAnimationActivation)
}



const activateSelectedPlanningIdeaInMap = (selectedFeature: Feature) => {
  const currentBearing = map.getBearing();
  let bounds = turf.bbox(selectedFeature) as LngLatBoundsLike;
  map.fitBounds(bounds, { pitch: 40, bearing: currentBearing, padding: 40 });

  // @ts-ignore
  if (selectedFeature.type == 'FeatureCollection') {


    map.setPaintProperty('routes', 'line-color', ['get', 'color']);
  } else {
    map.setPaintProperty(
      'routes',
      'line-color',
      ['match', ['get', 'id'], selectedFeature.properties.id, selectedFeature.properties.color, 'rgba(0,0,0,0.4)' /*['get', 'color']*/],
    )
  }
}

const navigateToPlanningIdea = (planningIdeaBBOX: LngLatBoundsLike) => {

  setTimeout(() => {
    map.fitBounds(planningIdeaBBOX, {
      pitch: 60,
      duration: 3000,
      curve: 4,
    });
  }, 2000);
}

const switchView = (newTabIndex: string) => {
  tabIndex.value = newTabIndex
}

const closeCommentDialog = () => {
  showCommentDialog.value = false
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
  /* background-color: darkgray; */
  background: linear-gradient(rgba(195, 245, 255, 1), rgba(255, 199, 111, 1));
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
</style>