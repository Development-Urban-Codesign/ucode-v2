<template>
  <div>
    <v-textarea solo name="input-7-4" label="Kommentar erstellen" :modelValue="commentText"
      @update:modelValue="text => commentText = text"></v-textarea>
    <v-btn size="small" color="success" @click="submitComment" :disabled="!commentText">
      Senden
    </v-btn>
  </div>

</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useStore } from "vuex";
import { HTTP } from '../utils/http-common';
const store = useStore();
const props =
  defineProps({
    clickedCoordinates: Array,
    closePopup: Function
  })

let commentText = ref("")
const submitComment = () => {
  HTTP
  .post('add-comment', {
    userId: store.state.aoi.userId,
    projectId: store.state.aoi.projectSpecification.project_id,
    comment: commentText.value,
    position: props.clickedCoordinates
  })
  console.log("User: " + store.state.aoi.userId + " Projekt: " + store.state.aoi.projectSpecification.project_id)
  store.state.contribution.commentToggle = false
  let marker = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: props.clickedCoordinates
    }
  }
  let uniqueId= (Date.now() + Math.random() ).toString();
  console.log(uniqueId)
  store.commit("map/addSource", {
    id: uniqueId,
    geojson: {
      "type": "geojson",
      "data": marker
    }
    
  })

  store.commit("map/addLayer", {
    'id': uniqueId,
    'type': 'circle',
    'source': uniqueId,
    'paint': {
      'circle-color': 'green',
    }
  })

  props.closePopup!();
}

</script>

<style scoped>
</style>