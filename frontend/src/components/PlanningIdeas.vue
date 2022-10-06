<template>
<div>

</div>
</template>

<script setup>
import { onMounted } from "vue";
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";

import {
    getRoutesFromDB
} from "../service/backend.service";

const store = useStore();
const emit = defineEmits(["addLayer"])
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
</style>