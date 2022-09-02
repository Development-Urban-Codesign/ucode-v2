<template >
  <v-layout justify="center" align="center">
    <v-row justify="center">
      <v-card align="center" v-if="true">
        <v-card-title>Welcome</v-card-title>
        <v-card-text> {{ introtext }} </v-card-text>
        <v-card v-for="(item, i) in quests" :key="i">
          <v-banner lines="auto" color="black" :id="i" style="margin:5px; background-color:{{this.clicked}} ? red : green;"> 
            <v-banner-text>
              {{ item.name }}
            </v-banner-text>
            <v-banner-actions>
              <v-btn @click="startQuest(i)">Start</v-btn>
              <v-btn>Leave</v-btn>
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
    </v-row>
  </v-layout>
</template>


<script setup>
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";

const store = useStore();
</script>
<script>
export default {
  data() {
    return {
      clicked: false,
      selectionColor: '#1c87c9',
      introtext: "Hi this is the Greetings Text!",
      quests: [
        {
          name: "At first, place three Comments on the map to show your most favorite places in the city!",
        },
        {
          name: "And then, place three Comments on the map to show your most favorite places in the city!",
        },
      ],
    };
  },
};
function startQuest(quest){
  console.log(quest)
  this.selectionColor = '#1c87c9'
}

function fulfillQuest(quest){
  console.log(quest)
  this.selectionColor = '#1c87c9'

// 1. Schritt: Unser klickt auf "Fulfill"
  // /add-quest-fullfilment" mit dem Wert der quest-ID als POST-Parameter
  // wie wird das gemacht?
  HTTP
    .post('add-quest-fulfillment', {
      questid: quest
    }).then((response)=>{
      console.log(response)
    })
}

</script>


<style scoped>
</style>