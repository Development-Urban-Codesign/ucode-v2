<template>
  <v-col
    cols="10"
    sm="1"
    style="position: absolute; right: 0; top: 60px; z-index: 999"
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
      @update:modelValue="sendGreeneryRequest_new"
    ></v-select>
    
  </v-col>
  
</template>

<script setup>
import { useStore } from "vuex";
import {
  getbuildingsFromDB,
  getbuildingsFromOSM,
  storeGreeneryFromOSM,
  getGreeneryFromDB,
} from "../service/backend.service";
const store = useStore();

const emit = defineEmits(["addLayer"]);

const sendBuildingRequest = async (mode) => {
  if (mode == "get") {
    await getbuildingsFromOSM(store.state.aoi.bbox);
  } else {
    const newLayer = await getbuildingsFromDB();
    emit("addLayer", newLayer);
  }
};
const sendGreeneryRequest_new = async (mode) => {
  if (mode == "get") {
    await storeGreeneryFromOSM(
      store.state.aoi.bbox,
      store.state.aoi.usedTagsForGreenery
    ).then();
  } else {
    const newLayer = await getGreeneryFromDB();
    emit("addLayer", newLayer);
  }
};
const sendGreeneryRequest = (e) => {
  e == "get"
    ? store.dispatch("aoi/getGreeneryFromOSM")
    : store.dispatch("aoi/getGreeneryFromDB");
};
</script>

<style scoped>
</style>