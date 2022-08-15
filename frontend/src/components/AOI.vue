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
const store = useStore();

const sendBuildingRequest = (e) => {
  if (e == "get") {
    store.dispatch("aoi/getbuildingsFromOSM");
    store.dispatch("aoi/setDataIsLoading");
  } else {
    store.dispatch("aoi/getbuildingsFromDB");
  }
};
const sendGreeneryRequest = (e) => {
  if (e == "get") {
    store.dispatch("aoi/getGreeneryFromOSM");
    store.dispatch("aoi/setDataIsLoading");
  } else {
    store.dispatch("aoi/getGreeneryFromDB");
  }
};
</script>

<style scoped>
</style>