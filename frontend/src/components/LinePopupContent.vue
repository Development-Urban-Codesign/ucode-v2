<template>
<div> 
  <v-card >
    <v-tabs
      v-model="tab"
      fixed-tabs
      background-color="#418df2"
      color="white"
    >
      <v-tab value="one" prepend-icon="mdi-comment">comment</v-tab>
      <v-tab value="two" prepend-icon="mdi-palette">style</v-tab>
    </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="one">
          <v-textarea
            
          label="description"
            v-model="drawnLineComment"
        >
        </v-textarea>

        </v-window-item>

        <v-window-item value="two">
            <div class="text-caption ml-2">width: {{drawnLineWidth}} m</div>

            <v-slider
                v-model="drawnLineWidth"
                min="1"
                max="10"
                step="1"
                @update:modelValue="updateDrwanLineWidth"
                class="ml-2"
            ></v-slider>

            <div class="text-caption ml-2">color</div>

           <input class="ml-2" type="color" v-model="drawnLineColor" @update:modelValue="updateDrwanLineColor">

        </v-window-item>

      </v-window>
  </v-card>

    <v-btn class="mt-2" flat variant="outlined" size="small" color="success" @click="submitDrawnLine">sumbit</v-btn>
    <v-btn class="mt-2 ml-2" flat variant="outlined" size="small" color="error"  @click="discardDrawnLine">cancel</v-btn>

  </div>
</template>

<script setup>
import {useStore} from "vuex";
import { ref, defineProps } from 'vue';
const store = useStore();
import { HTTP } from '../utils/http-common';

const props =
  defineProps({
    closeLinePopup: Function,
    drawnLineGeometry: Object,
    changeColor: Function,
    changeWidth: Function,
    removeDrawnLineAction: Function,
    removeDrawControlAction: Function
  })

let tab = ref(null)
let drawnLineComment= ref("")
let drawnLineWidth= ref(1)
let drawnLineColor= ref("#969696")

const updateDrwanLineWidth = ()=>{
  props.changeWidth(drawnLineWidth.value)
}

const updateDrwanLineColor = ()=>{
  const r = parseInt(drawnLineColor.value.substr(1,2), 16)
  const g = parseInt(drawnLineColor.value.substr(3,2), 16)
  const b = parseInt(drawnLineColor.value.substr(5,2), 16)
  props.changeColor(r,g,b)
}

const discardDrawnLine = ()=>{
  props.closeLinePopup();
  props.removeDrawnLineAction()
  props.removeDrawControlAction()
}

const submitDrawnLine = ()=>{

    HTTP
    .post('add-drawn-line', {
        comment: drawnLineComment.value,
        width: drawnLineWidth.value,
        color: drawnLineColor.value,
        geometry: props.drawnLineGeometry
    })
    props.closeLinePopup();
    props.removeDrawControlAction()
    
}
</script>

<style scoped>

</style>