<template>
  <RouterView />
</template>

<script lang="ts" setup>
import { watch } from "vue";
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
      store.commit("aoi/setUserId", Math.round(new Date().getTime() / 1000)); // if no userId is set then the user gets the seconds since 1.1.1970 as ID
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
html,
body {
  margin: 0;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
}
</style>