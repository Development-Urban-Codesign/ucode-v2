<template>
  <v-col
    cols="10"
    sm="1"
    style="position: absolute; right: 0; top: 0px; z-index: 999"
  >
  <v-select
      :items="['get', 'retrieve']"
      label="building"
      variant="outlined"
      @update:modelValue="sendBuildingRequest"
    ></v-select>
    <v-select
      :items="['get', 'retrieve']"
      label="greenery"
      variant="outlined"
      @update:modelValue="sendGreeneryRequest"
    ></v-select>
    <v-select
      :items="['get', 'retrieve']"
      label="tree"
      variant="outlined"
      @update:modelValue="sendTreeyRequest"
    ></v-select>
    <v-select
      :items="['get', 'retrieve']"
      label="driving lane"
      variant="outlined"
      @update:modelValue="sendDrivingLaneRequest"
    ></v-select>
    <v-alert type="success" v-if="store.state.aoi.dataIsLoaded">
      stored
    </v-alert>
    <v-alert type="info" v-if="store.state.aoi.dataIsLoading">
      getting data...
    </v-alert>
  </v-col>
</template>

<script setup>
import { useStore } from "vuex";
import {
  getbuildingsFromDB,
  getbuildingsFromOSM,
  storeGreeneryFromOSM,
  getGreeneryFromDB,
  getGreeneryFromDBTexture,
  getTreesFromOSM,
  getTreesFromDB,
  getDrivingLaneFromOSM,
  getDrivingLaneFromDB
} from "../service/backend.service";
const store = useStore();

const emit = defineEmits(["addLayer", "addImage"]);

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
</script>

<style scoped>
</style>