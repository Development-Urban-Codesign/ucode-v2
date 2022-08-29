<template >
  <v-layout align="center">
    <v-row justify="center">
      <v-card align="center" v-if="true">
        <v-card-title>Welcome</v-card-title>
        <v-card-text> {{ introText }} </v-card-text>
        <v-card v-for="(item, i) in quests" :key="i">
          <v-banner
            lines="auto"
            color="black"
            :id="i"
            :style="{backgroundColor: 'item.bgColor'}"
          >
            <v-banner-text>
              {{ item.name }}
            </v-banner-text>
            <v-banner-actions>
              <v-btn @click="startQuest(i)">Start</v-btn>
              <v-btn>Leave</v-btn>
              <v-btn>Fulfill</v-btn>
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
const store = useStore();
let quests = [
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
];
let introText = "Hi this is the greetings text, this project is about your participation and the goal is to change the city!"
</script>
<script>
function startQuest(id) {
  console.log(this.quests[id].bgColor)
  this.quests[id].bgColor = 'lightblue'
}
</script>


<style scoped>
</style>