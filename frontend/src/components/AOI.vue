<template>
  <DevUI @startPopulate="populateMap()" v-if="devMode" />
</template>

<script lang="ts" setup>
import type * as THREE from 'three'
import { onMounted, computed, reactive } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB, getDrivingLaneFromDB, getGreeneryFromDBTexture, getTrafficSignalFromDB, getTreesFromDB, getTreeJsonFromDB, getTreesFromOSM
} from "../service/backend.service";
import { TreeModel } from "../utils/TreeModel";
import DevUI from "@/components/DevUI.vue"
import { ThreejsScene } from "@/utils/ThreejsScene";
import { ThreejsSceneOnly } from "@/utils/ThreejsSceneOnly";
import type { ThrottledInvoker } from "maplibre-gl";
import { AddGeoOnPointsToThreejsScene } from '@/utils/ThreejsGeoOnPoints';
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);
const threeJsScene: THREE.Scene = reactive({})

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
  threeJsScene.value = threeJsSceneLayer.scene
  // threeJsScene.value = threeJsSceneLayer.scene

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
    AddGeoOnPointsToThreejsScene(threeJsScene,treeJson,"TreeVariants/Tree_02.glb",[0.7, 0.8], true)
  }
  else {
    if (true) {//import trees with THREE JS and Instancing
      const treeJson = await getTreeJsonFromDB(store.state.aoi.projectSpecification.project_id);
      if (true) {
        let trees: string[] = ["Tree_01.glb", "Tree_02.glb", "Tree_03.glb"]
        let ArrayIndex: number[] = []
        for (let index = 0; index < treeJson.features.length; index++) {
          let int = Math.round((Math.random() * ((trees.length - 1) - 0)) + 0)
          ArrayIndex.push(int)
        }
        for (let index = 0; index < trees.length; index++) {
          let partJson: { type: string, features: any[] } = { type: "FeatureCollection", features: [] }
          for (let index1 = 0; index1 < treeJson.features.length; index1++) {
            if (ArrayIndex[index1] == index) {
              partJson.features.push(treeJson.features[index1])
            }
          }
          emit("addLayer", ThreejsScene(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin, partJson, "TreeVariants/" + trees[index], [0.7, 0.8], true));
        }
      }

      else { //the old way with threejs, only one treemodel
        emit("addLayer", ThreejsScene(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin, treeJson, "Tree2.glb", [0.7, 0.8], true));
      }
    } else { //the old way with deckgl
      const treeLayer = await getTreesFromDB(store.state.aoi.projectSpecification.project_id);
      emit("addLayer", treeLayer);
    }
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