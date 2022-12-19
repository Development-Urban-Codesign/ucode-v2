<template >
  <v-card id="quests" v-if=showQuests>

    <v-card-title v-if="greeting" align="center">
      {{$t("Quest.greeting")}}
      <v-btn icon="mdi-close-circle-outline" @click="showQuests=false" class="ma-2" variant="text"
        style="position: absolute; right: 0%; top:-5%;">
      </v-btn>
    </v-card-title>
    <v-card-text v-if="greeting" align="center"> {{ introText }} </v-card-text>
    <v-btn
      style="left: 50%; transform: translate(-50%, 0)"
      flat
      v-if="greeting"
      @click="startAdventure"
    >
      {{$t("Quest.startAdventure")}}</v-btn
    >
    <v-card
      align="center"
      justify="center"
      v-for="(item, i) in quests"
      :key="i"
    >
      <v-banner
        v-if="item.isActive"
        lines="one"
        color="black"
        :id="i"
        :style="{ backgroundColor: item.bgColor }"
      >
        <v-banner-text>
          {{ item.name }}
        </v-banner-text>
        <v-banner-actions>
          <!-- <v-btn v-if="i == 0 && greeting" @click="startQuest(i)">Start</v-btn> -->
          <v-btn v-if="!greeting" @click="cancelQuest(i)">Überspringen</v-btn>
          <v-btn v-if="!greeting" @click="fulfillQuest(i, item)">Abschließen</v-btn>
        </v-banner-actions>
      </v-banner>
    </v-card>
  </v-card>
</template>

<script lang="ts" setup>
import { useStore } from "vuex";
import { HTTP } from "@/utils/http-common";
import { prepareQuestsUserTable } from "@/service/backend.service";
import { getQuestsFromDB } from "../service/backend.service";
import { onMounted, reactive, ref } from "vue";
onMounted(() => {
  getQuestsFromDB(store.state.aoi.projectId).then((response) => {
    setupQuests(response);
  });
});
let showQuests = ref(true);
let greeting = ref(true);
const store = useStore();
let quests1 = reactive<Quest[]>([]);
let quests = reactive<Quest[]>([]);
let introText = ref();

type Quest = { name: any; isActive: boolean; id: number; bgColor?:string }

// check if the quests_user table is ready 
//let stateQuests = 
let stateQuests = await prepareQuestsUserTable(store.state.aoi.projectId, store.state.aoi.userId)
console.log(stateQuests)

function setupQuests(questsData:any[]) {
  for (let i = 0; i < questsData.length; i++) {
    if (questsData[i][0] == questsData.length) {
      //introText is always last item in quests db
      introText.value = questsData[i][2];
    } else {
      const element = {
        name: questsData[i][2],
        isActive: false,
        id: questsData[i][0],
      };
      quests1.push(element);
    }
  }
  for (let index = 0; index < quests1.length; index++) {
    //create new array with quests sorted by id
    for (let j = 0; j < quests1.length; j++) {
      if (quests1[j].id == index + 1) {
        quests.push(quests1[j]);
      }
    }
  }
}

async function startAdventure() {
  quests[0].isActive = true;
  greeting.value = false;
  //@ts-ignore
  document.getElementById("quests").style.top = "0px";
  //@ts-ignore
  document.getElementById("quests").style.transform= "translate(-50%, 0%)";
}

function cancelQuest(id:number) {
  quests[id].bgColor = "grey";
  setTimeout(() => (quests[id].isActive = false), 300);
  if (id < quests.length - 1) {
    setTimeout(() => (quests[id + 1].isActive = true), 300);
  }
}
function fulfillQuest(id:number, quest:Quest) {
  quests[id].bgColor = "lightgreen";
  HTTP.post("add-quest-fulfillment", {
    questid: quest.id,
    projectId: store.state.aoi.projectSpecification.project_id
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
  position: absolute;
  left:50%;
  top: 50%;
  transform: translate(-50%, -50%);
  /* margin: auto;
  top: 30vh; */
}
</style>