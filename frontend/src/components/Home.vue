<template>
  <div class="main-loader">
    <Loadingscreen v-if="!hideLoadingScreen"> </Loadingscreen>
    <Map v-if="projectsLoaded"></Map>
  </div>
</template>

<script lang="ts" setup>
import Loadingscreen from '@/components/Loadingscreen.vue';
import Map from '@/components/Map.vue';
import type { UiState } from '@/store/modules/ui';
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

const projectsLoaded = ref(false);
const devMode = ref(false);
const aoiMapPopulated = ref(false);
const store = useStore();

watch(store.state.ui, function (state: UiState) {
  console.log('ui store changes detected');
  devMode.value = state.devMode;
  projectsLoaded.value = state.devMode || state.projectsLoaded;
  aoiMapPopulated.value = state.aoiMapPopulated;
});


const hideLoadingScreen = computed<boolean>(
  () => projectsLoaded.value && aoiMapPopulated.value
);

</script>

<style scoped>

</style>