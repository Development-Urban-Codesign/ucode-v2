<template>
  <RouterView />
</template>

<script setup>
import { RouterView, useRoute } from "vue-router";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
const t = useI18n();


    const route = useRoute()
    // fetch the user information when params change
    watch(
      () => route.hash,
      async newLangHash => {
        // TODO refactor me!!!
        const lang = newLangHash.split("#lang=")[1]
        t.locale.value = lang;
      }
    )


</script>

<style >
html, body {
  margin: 0;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
}

</style>