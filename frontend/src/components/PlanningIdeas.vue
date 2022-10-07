<template>

<v-sheet
    class="mx-auto planning-ideas-options"
    max-width="600"
  >
    <v-slide-group
      show-arrows
    >
      <v-slide-group-item
        v-for="route in planningData.routes" :key="route.properties.id"
        v-slot="{ isSelected, toggle }"
      >
        <v-btn
          class="ma-2"
          rounded
          :color="isSelected ? 'primary' : undefined"
          @click="toggle"
          flat
        >
          route {{route.properties.id}}
        </v-btn>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>

</template>

<script setup>
import { onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";

import {
    getRoutesFromDB
} from "../service/backend.service";

const store = useStore();
const emit = defineEmits(["addLayer"])
let planningData = reactive ({ routes: [] })
const addRouteToMap = async()=>{
  await sendRouteRequest()
}
onMounted(() => {
    HTTP.get("project-specification", {
        params: 
        {
          projectId: store.state.aoi.projectId
        }
      }).then((response) => {
        store.commit("aoi/setProjectSpecification", response.data[0])
    }).then(()=>{
        addRouteToMap()
    })

})

const sendRouteRequest = async () => {
    const routeData = await getRoutesFromDB(store.state.aoi.projectSpecification.project_id)
   
    planningData.routes = routeData.data.features

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
            "line-color": [
                "match",
                    ["get", "id"],
                    1,
                    "rgba(255,0,0,1)",
                    2,
                    "rgba(0,255,0,1)",
                    "rgba(0,0,255,1)",
            ],
            'line-width': 6,
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

};

</script>

<style scoped>
.planning-ideas-options {
  position:relative;
  top: 94%;
  z-index: 999;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.v-sheet{

}
</style>