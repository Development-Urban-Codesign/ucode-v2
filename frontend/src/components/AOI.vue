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
      @update:modelValue="sendGreeneryRequest"
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
</script>

<style scoped>
</style>