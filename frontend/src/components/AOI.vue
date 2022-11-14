<template>
  <DevUI @startPopulate="populateMap()" v-if="devMode" />
</template>

<script lang="ts" setup>
import DevUI from "@/components/DevUI.vue";
import { addGeoOnPointsToThreejsScene, addPolygonsFromCoordsAr } from '@/utils/ThreejsGeometryCreation';
import { ThreejsSceneOnly } from "@/utils/ThreejsSceneOnly";
import type { FeatureCollection } from "geojson";
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB, getDrivingLaneFromDB, getGreeneryFromDBTexture, getTrafficSignalFromDB, getTreeJsonFromDB, getTreesFromDB
} from "../service/backend.service";
import { ThreejsScene } from "@/utils/ThreejsScene";
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);
let threeJsScene: any;

const emit = defineEmits(["addLayer", "addImage", "triggerRepaint"]);
const populateMap = async () => {
  await sendBuildingRequest();
  await createEmptyThreeJsScene();
  await sendGreeneryRequest();
  await sendTrafficSignalRequest();
  await sendDrivingLaneRequest();
  await createEmptyThreeJsScene();
  await sendTreeRequest();
  await createAoiPlane();
  store.dispatch("aoi/setMapIsPopulated");
  store.commit("ui/aoiMapPopulated", true);
}

onMounted(() => {
  populateMap();
})
const createEmptyThreeJsScene = async () => {
  const threeJsSceneLayer = await ThreejsSceneOnly(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin)
  //console.log(threeJsSceneLayer.scene)
  threeJsScene = threeJsSceneLayer.scene
  emit("addLayer", threeJsSceneLayer.layer)
}

const sendBuildingRequest = async () => {
  const newLayer = await getbuildingsFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequest = async () => {
  const newLayer = await getGreeneryFromDBTexture(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const createAoiPlane = async () => {
  const data: FeatureCollection = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin]
        },
        'properties': {}
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [store.state.aoi.projectSpecification.bbox.xmax, store.state.aoi.projectSpecification.bbox.ymin]
        },
        'properties': {}
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [store.state.aoi.projectSpecification.bbox.xmax, store.state.aoi.projectSpecification.bbox.ymax]
        },
        'properties': {}
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymax]
        },
        'properties': {}
      }
    ]
  }
  //emit("addLayer", ThreejsPolygon(store.state.aoi.projectSpecification.bbox, data))
  addPolygonsFromCoordsAr(threeJsScene, store.state.aoi.projectSpecification.bbox, data)
  // emit("triggerRepaint")
}
const sendTreeRequest = async () => {
  if (true) {//import trees with THREE JS
    const treeJson: FeatureCollection = await getTreeJsonFromDB(store.state.aoi.projectSpecification.project_id);
    if (true) {
      let trees: string[] = ["Tree_01.glb", "Tree_02.glb", "Tree_03.glb"]
      let ArrayIndex: number[] = []
      treeJson.features.forEach(() => {
        let int = Math.round((Math.random() * ((trees.length - 1) - 0)) + 0)
        ArrayIndex.push(int)
      })
      trees.forEach((tree, _index) => {
        let partJson: { type: string, features: any[] } = { type: "FeatureCollection", features: [] }
        treeJson.features.forEach((feature, index) => {
          if (ArrayIndex[index] == _index) {
            partJson.features.push(feature)
          }
        })
        addGeoOnPointsToThreejsScene(threeJsScene, partJson, "TreeVariants/" + tree, store.state.aoi.projectSpecification.bbox, [0.7, 0.8], true)
        // emit("triggerRepaint")
      })
    }

    else { //the old way with threejs, only one treemodel
      emit("addLayer", ThreejsScene(store.state.aoi.projectSpecification.bbox, treeJson, "Tree2.glb", [0.7, 0.8], true));
    }
  } else { //the old way with deckgl
    const treeLayer = await getTreesFromDB(store.state.aoi.projectSpecification.project_id);
    emit("addLayer", treeLayer);
  }
}


const sendDrivingLaneRequest = async () => {
  const drivingLanedata = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)

  store.commit("map/addSource", {
    id: "driving_lane_polygon",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.data.polygon
    }
  })
  store.commit("map/addLayer", {
    'id': "driving_lane_polygon",
    'type': 'fill',
    'source': "driving_lane_polygon",
    'paint': {
      'fill-color': '#798999',
      'fill-opacity': 1
    }
  })

  store.commit("map/addSource", {
    id: "driving_lane",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.data.lane
    }
  })
  store.commit("map/addLayer", {
    'id': "driving_lane",
    'type': 'line',
    'source': "driving_lane",
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#FFFFFF',
      'line-width': 1,
      'line-dasharray': [10, 20]
    }
  })

}


const sendTrafficSignalRequest = async () => {

  const trafficSignalLayer = await getTrafficSignalFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", trafficSignalLayer)

}
</script>

<style scoped>

</style>