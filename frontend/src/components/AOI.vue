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
const store = useStore();

const emit = defineEmits(["addLayer", "addImage"]);
const populateMap = async()=>{
  await sendBuildingRequest("retrieve").then(async()=>{
  await sendGreeneryRequest("retrieve")}).then(
  await sendTreeyRequest("retrieve")).then(
  await sendTrafficSignalRequest("retrieve")).then(
  await sendDrivingLaneRequest("retrieve")).then(store.dispatch("aoi/setMapIsPopulated"));
}
onMounted(() => {
  populateMap()

})
const sendBuildingRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getbuildingsFromOSM(store.state.aoi.bbox);
  } else {
    const newLayer = await getbuildingsFromDB();
    emit("addLayer", newLayer);
  }
};
const sendGreeneryRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await storeGreeneryFromOSM(
      store.state.aoi.bbox,
      store.state.aoi.usedTagsForGreenery
    );
  } else {
    const newLayer = await getGreeneryFromDBTexture();
    emit("addLayer", newLayer);
  }
};

const sendTreeyRequest= async (mode)=>{
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getTreesFromOSM(store.state.aoi.bbox);
  } else {
    const treeLayer = await getTreesFromDB();
    emit("addLayer", treeLayer);
  }
}
const addDrivingLanes = async () =>{

  const drivingLanedata = await getDrivingLaneFromDB();
    
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
const sendDrivingLaneRequest = async (mode)=>{
  if (mode == "get") {
  store.dispatch("aoi/setDataIsLoading");
   await getDrivingLaneFromOSM(store.state.aoi.bbox);
  }
  else {
    
    const drivingLanedata = await getDrivingLaneFromDB();
    console.log(drivingLanedata)
    


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
}

const sendTrafficSignalRequest = async (mode)=>{
  if (mode == "get"){
    store.dispatch("aoi/setDataIsLoading");
    await getTrafficLightsFromOSM(store.state.aoi.bbox);
  }
  else {
    const trafficSignalLayer = await getTrafficSignalFromDB();
    emit("addLayer", trafficSignalLayer);
  }
  
}
</script>

<style scoped>
</style>