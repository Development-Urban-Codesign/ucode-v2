<template>
  <DevUI @startPopulate="populateMap()" v-if="devMode" />
</template>

<script lang="ts" setup>
import DevUI from "@/components/DevUI.vue";
import { addGeoOnPointsToThreejsScene, addLineFromCoordsAr, addPolygonsFromCoordsAr } from '@/utils/ThreejsGeometryCreation';
import { ThreejsSceneOnly } from "@/utils/ThreejsSceneOnly";
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB, getDrivingLaneFromDB, getGreeneryFromDBTexture, getGreeneryJsonFromDB, getTrafficSignalFromDB, getTreeJsonFromDB, getTreesFromDB, getWaterFromDB
} from "../service/backend.service";
import { ThreejsScene } from "@/utils/ThreejsScene";
import type { FeatureCollection } from "@turf/helpers";
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);
let threeJsScene: any;

const emit = defineEmits(["addLayer", "addImage", "triggerRepaint"]);
const populateMap = async () => {
  await sendBuildingRequest();
  await createEmptyThreeJsScene();
  // await sendGreeneryRequest();
  await sendGreeneryRequestTHREE();
  await sendTrafficSignalRequest();
  //  await sendDrivingLaneRequest();
  await sendDrivingLaneRequestTHREE();
  await createEmptyThreeJsScene();
  await sendTreeRequest();
  await sendWaterRequestTHREE();
  await createAoiPlane();
  store.dispatch("aoi/setMapIsPopulated");
  store.commit("ui/aoiMapPopulated", true);
}

onMounted(() => {
  populateMap();
})
const createEmptyThreeJsScene = async () => {
  const threeJsSceneLayer = await ThreejsSceneOnly(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin)
  //console.log(threeJsSceneLayer.scene)
  threeJsScene = threeJsSceneLayer.scene
  emit("addLayer", threeJsSceneLayer.layer)
}

const sendBuildingRequest = async () => {
  const newLayer = await getbuildingsFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequest = async () => {
  const newLayer = await getGreeneryFromDBTexture(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequestTHREE = async () => {
  const greeneryJson: FeatureCollection = await getGreeneryJsonFromDB(store.state.aoi.projectSpecification.project_id);
  console.log(greeneryJson)
  
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: greeneryJson,
    color: "#9EBB64",
    zIndex: 0,
    extrude: 0.1
  })
  

};
const sendWaterRequestTHREE = async () => {
  const waterJson: FeatureCollection = await getWaterFromDB(store.state.aoi.projectSpecification.project_id);
  console.log(waterJson)
  
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: waterJson,
    color: "#64A4BB",
    zIndex: 0,
    extrude: 0.12
  })
  

};
const createAoiPlane = async () => {
  console.log("AOIPlane")
  const data: FeatureCollection = {
    'type': 'FeatureCollection',//redo as polygon..be smart
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': 
          [[[store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin],
          [store.state.aoi.projectSpecification.bbox.xmax, store.state.aoi.projectSpecification.bbox.ymin],
          [store.state.aoi.projectSpecification.bbox.xmax, store.state.aoi.projectSpecification.bbox.ymax],
          [store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymax]]]
        },
        'properties': {}
      }
    ]
  }
  //emit("addLayer", ThreejsPolygon(store.state.aoi.projectSpecification.bbox, data))
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: data,
    color: "#2C343D",
    zIndex: 0,
    extrude: 0
  })
  // emit("triggerRepaint")
}
const sendTreeRequest = async () => {
  if (true) {//import trees with THREE JS
    const treeJson: FeatureCollection = await getTreeJsonFromDB(store.state.aoi.projectSpecification.project_id);
    if (true) {
      let trees: string[] = ["Tree_01.glb", "Tree_02.glb", "Tree_03.glb"]
      let ArrayIndex: number[] = []
      treeJson.features.forEach(() => {
        let int = Math.round((Math.random() * ((trees.length - 1) - 0)) + 0)
        ArrayIndex.push(int)
      })
      trees.forEach((tree, _index) => {
        let partJson: { type: string, features: any[] } = { type: "FeatureCollection", features: [] }
        treeJson.features.forEach((feature, index) => {
          if (ArrayIndex[index] == _index) {
            partJson.features.push(feature)
          }
        })
        addGeoOnPointsToThreejsScene(threeJsScene, partJson, "TreeVariants/" + tree, store.state.aoi.projectSpecification.bbox, [0.7, 0.8], true)
        // emit("triggerRepaint")
      })
    }

    else { //the old way with threejs, only one treemodel
      emit("addLayer", ThreejsScene(store.state.aoi.projectSpecification.bbox, treeJson, "Tree2.glb", [0.7, 0.8], true));
    }
  } else { //the old way with deckgl
    const treeLayer = await getTreesFromDB(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", treeLayer);
  }
}


const sendDrivingLaneRequestTHREE = async () => {
  const drivingLanedata: {lane:FeatureCollection, polygon: FeatureCollection} = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)
  console.log(drivingLanedata.lane)
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: drivingLanedata.polygon,
    color: "#262829",
    zIndex: 0,
    extrude: 0.15
  })
  addLineFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: drivingLanedata.lane,
    color: "#ffffff",
    zIndex: 0.15,
    extrude: 0.2
  })

}
const sendDrivingLaneRequest = async () => {
  const drivingLanedata = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)

  store.commit("map/addSource", {
    id: "driving_lane_polygon",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.polygon
    }
  })
  store.commit("map/addLayer", {
    'id': "driving_lane_polygon",
    'type': 'fill',
    'source': "driving_lane_polygon",
    'paint': {
      'fill-color': '#798999',
      'fill-opacity': 1
    }
  })

  store.commit("map/addSource", {
    id: "driving_lane",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.lane
    }
  })
  store.commit("map/addLayer", {
    'id': "driving_lane",
    'type': 'line',
    'source': "driving_lane",
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#FFFFFF',
      'line-width': 1,
      'line-dasharray': [10, 20]
    }
  })

}


const sendTrafficSignalRequest = async () => {

  const trafficSignalLayer = await getTrafficSignalFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", trafficSignalLayer)

}
</script>

<style scoped>

</style>