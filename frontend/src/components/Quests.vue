<template >
  <v-layout justify="center" align="center">
    <v-row justify="center">
      <v-card align="center" v-if="true">
        <v-card-title>Welcome</v-card-title>
        <v-card-text> {{ introtext }} </v-card-text>
        <v-card v-for="item in quests" :key="item.name">
          <v-banner lines="auto" color="black" id=item.name>
            <v-banner-text>
              {{ item.name }}
            </v-banner-text>
            <v-banner-actions>
              <v-btn @click="startQuest(item)">Start</v-btn>
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
        </v-card>
      </v-card>
    </v-row>
  </v-layout>
</template>


<script setup>
import { useStore } from "vuex";
const store = useStore();
</script>
<script>
export default {
  data() {
    return {
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
  console.log(quest.name);
  this.quest.style.backgroundColor = 'dark';
}

</script>


<style scoped>
</style>