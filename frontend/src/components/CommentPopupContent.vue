<template>
  <div>
    <v-textarea solo name="input-7-4" label="leave a comment" :modelValue="commentText"
      @update:modelValue="text => commentText = text"></v-textarea>
    <v-btn size="small" color="success" @click="submitComment" :disabled="!commentText">
      Submit
    </v-btn>
  </div>

</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useStore } from "vuex";
const store = useStore();
import { HTTP } from '../utils/http-common';
const props =
  defineProps({
    clickedCoordinates: Array,
    closePopup: Function
  })

let commentText = ref("")

const submitComment = () => {
  HTTP
  .post('add-comment', {
    comment: commentText.value,
    position: props.clickedCoordinates
  })

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

  props.closePopup();
}

</script>

<style scoped>
</style>