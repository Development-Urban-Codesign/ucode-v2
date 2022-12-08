<template>
  <v-app>
    <RouterView />
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { RouterView, useRoute } from "vue-router";
import { useStore } from "vuex";
import { HTTP } from "./utils/http-common";
const t = useI18n();

const store = useStore();
const route = useRoute();

// initProjects

// fetch the user information when params change
watch(
  () => route.hash,
  async (newLangHash) => {
    // TODO refactor me!!!
    const lang = newLangHash.split("#lang=")[1];
    t.locale.value = lang;
  }
);

watch(
  () => route.query,
  async (routeQueries) => {
    if (routeQueries.devmode == "true") {
      store.commit("ui/toggleDevMode", true);
    }
    if (routeQueries.project != null) {
      store.commit("aoi/setProjectId", routeQueries.project);
    } else {
      store.commit("aoi/setProjectId", "0"); // if no project is set then projectId is "0" = Mainz
    }
    if (routeQueries.user != null) {
      store.commit("aoi/setUserId", routeQueries.user);
    } else {
      store.commit("aoi/setUserId", "_" + Math.round(new Date().getTime() / 1000)); // if no userId is set then the user gets the seconds since 1.1.1970 as ID
    }
  }
);

// // initProjects
// HTTP.get("project-specification", {
//   params:
//   {
//     projectId: store.state.aoi.projectId
//   }
// }).then((response) => {
//   store.commit("aoi/setProjectSpecification", response.data[0]);
//   store.commit("ui/loadedProjects", true);
// });
</script>

<style >
html{
  margin: 0;
  /* height: 100%; */
  overflow: hidden !important;
  touch-action: none;
}

body {
  touch-action: none;
  margin: 0;
  overflow: hidden !important;
  /* width: 100vw;
  height: 100vh; */
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  max-height: -webkit-fill-available;
  max-height: -moz-available !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100%;
}

#app > div{
  height: 100%;
}

#app > div > div{
  min-height: auto !important;
  height: 100%;
}

#app > div > div > div{
  height: 100%;
}
</style>