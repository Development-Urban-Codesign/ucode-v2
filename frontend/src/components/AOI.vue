<template>
  <DevUI v-if="devMode" />
</template>

<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB, getDrivingLaneFromDB, getGreeneryFromDBTexture, getTrafficSignalFromDB, getTreesFromDB, getTreeJsonFromDB, getTreesFromOSM
} from "../service/backend.service";
import { TreeModel } from "../utils/TreeModel";
import DevUI from "@/components/DevUI.vue"
import { ThreejsScene } from "@/utils/ThreejsScene";
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);

const emit = defineEmits(["addLayer", "addImage"]);
const populateMap = async () => {
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
const sendBuildingRequest = async () => {
  const newLayer = await getbuildingsFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequest = async () => {
  const newLayer = await getGreeneryFromDBTexture(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};

const sendTreeRequest= async ()=>{
  if(true){//import trees with THREE JS
    const treeJson = await getTreeJsonFromDB(store.state.aoi.projectSpecification.project_id);
    //console.log(treeJson)
    emit("addLayer", ThreejsScene(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin,treeJson, "Tree2.glb",true,true));
  }else {
    const treeLayer = await getTreesFromDB(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", treeLayer);
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
      'fill-color': '#888',
      'fill-opacity': 0.8
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