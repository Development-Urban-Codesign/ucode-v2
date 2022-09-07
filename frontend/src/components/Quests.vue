<template >
  <v-card id="quests" v-if="true">
    <v-card-title v-if="greeting" align="center">Willkommen</v-card-title>
    <v-card-text v-if="greeting" align="center"> {{ introText }} </v-card-text>
    <v-btn style="left: 50%; transform: translate(-50%, 0);" flat v-if="greeting" @click="startAdventure"> Los gehts</v-btn>
    <v-card
      align="center"
      justify="center"
      v-for="(item, i) in quests"
      :key="i"
    >
      <v-banner
        v-if="item.isActive"
        lines="1"
        color="black"
        :id="i"
        :style="{ backgroundColor: item.bgColor }"
      >
        <v-banner-text>
          {{ item.name }}
        </v-banner-text>
        <v-banner-actions>
          <v-btn v-if="i == 0 && greeting" @click="startQuest(i)">Start</v-btn>
          <v-btn v-if="!greeting" @click="stopQuest(i)">Überspringen</v-btn>
          <v-btn v-if="!greeting" @click="fulfillQuest(i, item)">Abschließen</v-btn>
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
import { getQuestsFromDB } from "../service/backend.service";
// import { onMounted } from 'vue'
onMounted(() => {
  getQuestsFromDB().then((response) => {
    setupQuests(response);
  });
});

import { onMounted, reactive, ref } from "vue";
let greeting = ref(true);
const store = useStore();
let quests1 = reactive([]);
let quests = reactive([]);
let quests2 = reactive([
  {
    name: "Schau dir den Planungsraum an und nutze das Lininenwerkzeug, um eine Route einzuzeichnen, die du regelmäßig benutzt, um dich im Planungsgebiet zu bewegen.",
    isFulfilled: false,
    bgColor: "white",
    isActive: false,
  },
  {
    name: "Markiere mindestens 3 Orte, die durch die aktuelle Planung aufgewertet werden oder welche von einer der drei Varianten profitieren. Nutze die Kommentarfunktion um die Bereiche zu markieren. Erläutere kurz.",
    isFulfilled: false,
    bgColor: "white",
    isActive: false,
  },
  {
    name: "Markiere nun mindestens 3 Orte, wo du Konfliktpotential durch die Planungsvarianten siehst oder wo noch etwas verbessert werden kann. Bitte beschreibe deine Auswahl.",
    isFulfilled: false,
    bgColor: "white",
    isActive: false,
  },
  {
    name: "Markiere noch Orte, an welchen du die aktuelle Planung nicht verstehst und wo deiner Meinung nach Klärungsbedarf besteht.",
    isFulfilled: false,
    bgColor: "white",
    isActive: false,
  },
]);
let introText = ref();
// "Hallo und Willkommen zur Mobilitätsbeteiligung in Mainz. \nZum Ausbau des Straßenbahnnetzes soll eine neue Route in Mainz entstehen und es gibt schon jetzt die Möglichkeit Feedback und Ideen zur angedachten Planung einzureichen.\n";

function setupQuests(questsData) {
  for (let i = 0; i < questsData.length; i++) {
    if (questsData[i][0] == questsData.length) { //introText is always last item in quests db
      introText.value = questsData[i][2];
      // console.log(introText)
    } else {
      const element = {
        name: questsData[i][2],
        isFulfilled: false,
        isActive: false,
        id: questsData[i][0],
      };
      quests1.push(element);
    }
  }
  for (let index = 0; index < quests1.length; index++) { //create new array with quests sorted by id
    for (let j = 0; j < quests1.length; j++) {
      if (quests1[j].id == index+1) {
        quests.push(quests1[j]);
      }
    }
  }
}
async function startAdventure() {
  quests[0].isActive = true;
  greeting.value = false;
  document.getElementById("quests").style.top = "0px";
  console.log(quests);
}

function stopQuest(id, item) {
  quests[id].bgColor = "tomato";
  quests[id].isFulfilled = false;
  setTimeout(() => (quests[id].isActive = false), 300);
  if (id < quests.length - 1) {
    setTimeout(() => (quests[id + 1].isActive = true), 300);
  }
}
function fulfillQuest(id, quest) {
  quests[id].bgColor = "lightgreen";
  quests[id].isFulfilled = true;

  HTTP.post("add-quest-fulfillment", {
    questid: quest.id,
  });
  setTimeout(() => (quests[id].isActive = false), 300);
  if (id < quests.length - 1) {
    setTimeout(() => (quests[id + 1].isActive = true), 300);
  }
}
</script>


<style scoped>
#quests {
  z-index: 999;
  max-width: 50vw;
  margin: auto;
  top: 30vh;
}
</style>