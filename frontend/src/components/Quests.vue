<template >
 
      <v-card style="z-index:999; max-width:50vw; margin: auto; padding:auto;"  v-if="true">
        <v-card-title>Welcome</v-card-title>
        <v-card-text> {{ introText }} </v-card-text>
        <v-card v-for="(item, i) in quests" :key="i">
          <v-banner
            lines="auto"
            color="black"
            :id="i"
            :style="{backgroundColor: item.bgColor}"
          >
            <v-banner-text>
              {{ item.name }}
            </v-banner-text>
            <v-banner-actions>
              <v-btn @click="startQuest(i)">Start</v-btn>
              <v-btn @click="stopQuest(i)">Cancel</v-btn>
              <v-btn @click="fulfillQuest(i)">Fulfill</v-btn>
            </v-banner-actions>
          </v-banner>
        </v-card>
        <v-card>
          <!-- <v-table>
            <thead>
              <tr>
                <th class="text-left">Quest</th>
              </tr>
            </thead>
            <tbody align="center" style="min-height: 100px; background-color: ">
              <tr v-for="item in quests" :key="item.name">
                <v-col cols="auto">
                <td>{{ item.name }}</td>
                <v-button align="center"> Start</v-button>
                </v-col>
              </tr>
            </tbody>
          </v-table> -->
          <!-- {{clicked}}? 'red' : 'green' -->
        </v-card>
      </v-card>
    
</template>

<script setup>
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";

import {reactive} from "vue"

const store = useStore();
let quests = reactive([
  {
    name: "At first, place three Comments on the map to show your most favorite places in the city!",
    isFulfilled: false,
    bgColor: 'white'
  },
  {
    name: "And second, place three Comments on the map to show your most favorite places in the city!",
    isFulfilled: false,
    bgColor: 'white'
  },
]);
let introText = "Hi this is the greetings text, this project is about your participation and the goal is to change the city!"

function startQuest(id) {
  for (let j = 0; j < quests.length; j++) {
    if(j!=id){
      quests[j].bgColor = 'white'
    }
    else{
      quests[j].bgColor = 'lightblue'
    }
  }
}
function stopQuest(id){
  quests[id].bgColor = 'white'
}
function fulfillQuest(id){
  quests[id].bgColor = 'lightgreen'
// 1. Schritt: Unser klickt auf "Fulfill"
  // /add-quest-fullfilment" mit dem Wert der quest-ID als POST-Parameter
  // wie wird das gemacht?
  HTTP
    .post('add-quest-fulfillment', {
      questid: id
    }).then((response)=>{
      console.log(response)
    })
}

</script>


<style scoped>
</style>