<template>
    <v-sheet
        class="mx-auto planning-ideas-options"
    >
      <v-btn v-if = "store.state.ui.planningIdeasLoaded" :key="100"
        size="small" 
        :color="activeBtn==100 ? 'grey': 'white'" 
        rounded 
        flat 
        @click="activateSelectedPlanningIdea( planningData.routes); setActiveBtn(100)"
      >
            All
      </v-btn>
      <div v-for="route in planningData.routes.features" :key="route.properties.id">
        
        <v-btn 
          size="small"
          class="ml-2" 
          rounded 
          flat 
          @click="activateSelectedPlanningIdea(route); setActiveBtn(route.properties.id)" 
          :color="activeBtn==route.properties.id ? 'grey': 'white'"
        >
          <v-icon :color="route.properties.color">
            mdi-checkbox-blank-circle
          </v-icon>
          route {{route.properties.id}}
        </v-btn>
      </div>
    </v-sheet>
</template>




<script lang="ts" setup>
import { onMounted, reactive, watch, ref } from "vue";
import { useStore } from "vuex";
import bbox from "@turf/bbox";
import {
  getRoutesFromDB
} from "../service/backend.service";


const store = useStore();

const emit = defineEmits(["activateSelectedPlanningIdea", "navigateToPlanningIdea"])

let planningData = reactive ({ routes: [] })

let activeBtn = ref(100)

const setActiveBtn = (selectedId:any) =>{
  activeBtn.value = selectedId
}

const addRouteToMap = async () => {

  await sendRouteRequest()
}
onMounted(() => {
  addRouteToMap()
})

const sendRouteRequest = async () => {

    const routeData = await getRoutesFromDB(store.state.aoi.projectSpecification.project_id)
   if (routeData.data.features == null) {
    return
   }

    planningData.routes = routeData.data
    store.commit("map/addSource", {
      id: "routes",
      geojson: {
        "type": "geojson",
        "data": routeData.data
      }
    })
    store.commit("map/addLayer", {
        'id': "routes",
        'type': 'line',
        'source': "routes",
        'layout': {
            'line-join': 'round',
            'line-cap': 'round',
        },
        'paint': {
            'line-color': ['get', 'color']/*[
                "match",
                    ["get", "id"],
                    1,
                    "rgba(255,0,0,1)",
                    2,
                    "rgba(0,255,0,1)",
                    "rgba(0,0,255,1)",
            ]*/,
            'line-width': 5,
            'line-offset': {
              property: "id",
              type: "categorical",
              stops: [[1, -4], [2, 0], [3, -4]]
            },
            //'line-dasharray': [1,5]
        }
    })
    store.commit("map/addLayer", {
      "id": "routes-symbols",
      "type": "symbol",
      "source": "routes",
      "layout": {
        "symbol-placement": "line",
        "text-font": ["Open Sans Regular Bold"],
        "text-field": '{route_name}',
        "text-size": 10
      }
    })
    store.commit("ui/planningIdeasLoaded",true)

};

const activateSelectedPlanningIdea = (route)=>{
  
  emit("activateSelectedPlanningIdea", route)
}


watch(store.state.ui, function (state) {
  if (state.aoiMapPopulated ==true && state.projectsLoaded ==true && state.planningIdeasLoaded == true){
    const planningIdeaBBOX = bbox(planningData.routes);
    emit("navigateToPlanningIdea", planningIdeaBBOX)
  }
});




</script>

<style scoped>
.planning-ideas-options {
  position:sticky;
  bottom: 56px;
  margin-top: 5px;
  padding: 5px;
  z-index: 999;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: red;
  width: 100%;
  background: rgba(255,255,255,0.4);
  backdrop-filter: blur(5px);
}
</style>