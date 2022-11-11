<template>
  <DevUI @startPopulate="populateMap()" v-if="devMode" />
</template>

<script lang="ts" setup>
import DevUI from "@/components/DevUI.vue";
import { AddGeoOnPointsToThreejsScene } from '@/utils/ThreejsGeoOnPoints';
import { ThreejsSceneOnly } from "@/utils/ThreejsSceneOnly";
import type { Scene } from "three";
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB, getDrivingLaneFromDB, getGreeneryFromDBTexture, getTrafficSignalFromDB, getTreeJsonFromDB
} from "../service/backend.service";
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);
let threeJsScene: Scene;

const emit = defineEmits(["addLayer", "addImage"]);
const populateMap = async () => {
  createEmptyThreeJsScene();
  await sendBuildingRequest();
  await sendGreeneryRequest();
  await sendTreeRequest();
  await sendTrafficSignalRequest();
  await sendDrivingLaneRequest();
  store.dispatch("aoi/setMapIsPopulated");
  store.commit("ui/aoiMapPopulated", true);
}

onMounted(() => {
  populateMap();
})
const createEmptyThreeJsScene = async () => {
  const threeJsSceneLayer = await ThreejsSceneOnly(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin)
  console.log(threeJsSceneLayer.scene)
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

const sendTreeRequest = async () => {
  if (true) {
    const treeJson = await getTreeJsonFromDB(store.state.aoi.projectSpecification.project_id);
    AddGeoOnPointsToThreejsScene(threeJsScene, treeJson, "TreeVariants/Tree_02.glb", store.state.aoi.projectSpecification.bbox, [0.7, 0.8], true)
  }
  else {
  }
}


const sendDrivingLaneRequest = async () => {
  const drivingLanedata = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)

  store.commit("map/addSource", {
    id: "driving_lane_polygon",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.data.polygon
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
      "data": drivingLanedata.data.lane
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