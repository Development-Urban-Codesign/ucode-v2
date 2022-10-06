<template>
  <RouterView />
</template>

<script setup>
import { RouterView, useRoute } from "vue-router";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
const t = useI18n();

const store = useStore();
const route = useRoute();
// fetch the user information when params change
watch(
  () => route.hash,
  async newLangHash => {
    // TODO refactor me!!!
    const lang = newLangHash.split("#lang=")[1]
    t.locale.value = lang;
  }
)

watch(
  () => route.query,
  async routeQueries => {
    if (routeQueries.devmode == "true") {
      store.commit("aoi/setDevmode", routeQueries.devmode)
    }
    if (routeQueries.projectId != null) {
      store.commit("aoi/setProjectId", routeQueries.projectId)
      }
  }
)


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