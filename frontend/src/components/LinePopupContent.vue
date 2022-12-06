<template>
<div> 
  <v-card >
    <v-tabs
      v-model="tab"
      fixed-tabs
      background-color="#418df2"
      color="white"
    >
      <v-tab value="one" prepend-icon="mdi-comment">Kommentar</v-tab>
      <v-tab value="two" prepend-icon="mdi-palette">Stil</v-tab>
    </v-tabs>
      <v-window v-model="tab">
        <v-window-item value="one">
          <v-textarea
            
          label="Beschreibung"
            v-model="drawnLineComment"
        >
        </v-textarea>

        </v-window-item>

        <v-window-item value="two">
            <div class="text-caption ml-2">Breite: {{drawnLineWidth}} m</div>

            <v-slider
                v-model="drawnLineWidth"
                min="1"
                max="10"
                step="1"
                @update:modelValue="updateDrawnLineWidth"
                class="ml-2"
            ></v-slider>

            <div class="text-caption ml-2">Farbe</div>

           <input class="ml-2" type="color" v-model="drawnLineColor" @update:modelValue="updateDrawnLineColor">

        </v-window-item>

      </v-window>
  </v-card>

    <v-btn class="mt-2" flat variant="outlined" size="small" color="success" @click="submitDrawnLine">Senden</v-btn>
    <v-btn class="mt-2 ml-2" flat variant="outlined" size="small" color="error"  @click="discardDrawnLine">Abbruch</v-btn>

  </div>
</template>

<script lang="ts" setup>
import {useStore} from "vuex";
import { ref } from 'vue';
import { HTTP } from '../utils/http-common';
const store = useStore();

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

const updateDrawnLineWidth = ()=>{
  props.changeWidth!(drawnLineWidth.value)
}

const updateDrawnLineColor = ()=>{
  const r = parseInt(drawnLineColor.value.substr(1,2), 16)
  const g = parseInt(drawnLineColor.value.substr(3,2), 16)
  const b = parseInt(drawnLineColor.value.substr(5,2), 16)
  props.changeColor!(r,g,b)
}

const discardDrawnLine = ()=>{
  props.closeLinePopup!();
  props.removeDrawnLineAction!()
  props.removeDrawControlAction!()
}

const submitDrawnLine = ()=>{

    HTTP
    .post('add-drawn-line', {
        projectId: store.state.aoi.projectSpecification.project_id,
        comment: drawnLineComment.value,
        width: drawnLineWidth.value,
        color: drawnLineColor.value,
        geometry: props.drawnLineGeometry
    })
    props.closeLinePopup!();
    props.removeDrawControlAction!()
    
}
</script>

<style scoped>

</style>