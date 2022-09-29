<template>
  <DevUI v-if="store.state.aoi.isDevmode"/>
</template>

<script setup>
import { onMounted } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB,
  getbuildingsFromOSM,
  storeGreeneryFromOSM,
  getGreeneryFromDBTexture,
  getTreesFromOSM,
  getTreesFromDB,
  getDrivingLaneFromOSM,
  getDrivingLaneFromDB,
  getTrafficLightsFromOSM,
  getTrafficSignalFromDB
} from "../service/backend.service";
import DevUI from "./DevUI.vue";
import { HTTP } from "../utils/http-common";

const store = useStore();

const emit = defineEmits(["addLayer", "addImage"]);
const populateMap = async()=>{
  await sendBuildingRequest().then(async()=>{
  await sendGreeneryRequest()}).then(
  await sendTreeyRequest()).then(
  await sendTrafficSignalRequest()).then(
  await sendDrivingLaneRequest()).then(store.dispatch("aoi/setMapIsPopulated"));
}
onMounted(() => {
  console.log(store.state.aoi.projectId)
  HTTP.get("project-specification").then((response) => {
    store.commit("aoi/setProjectSpecification", response.data[0])
  }).then(()=>{
    populateMap()
  })
  

})
const sendBuildingRequest = async () => {
    const newLayer = await getbuildingsFromDB(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", newLayer);

};
const sendGreeneryRequest = async () => {
  
    const newLayer = await getGreeneryFromDBTexture(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", newLayer);

};

const sendTreeyRequest= async ()=>{
  
    const treeLayer = await getTreesFromDB(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", treeLayer);
  
}
const sendDrivingLaneRequest = async ()=>{

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
        'line-dasharray': [10,20]
      }
    })

}


const sendTrafficSignalRequest = async ()=>{
  
    const trafficSignalLayer = await getTrafficSignalFromDB(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", trafficSignalLayer)

}
</script>

<style scoped>
</style>