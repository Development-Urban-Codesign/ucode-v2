<template>
  <DevUI @startPopulate="populateMap()" v-if="devMode" />
</template>

<script lang="ts" setup>
import DevUI from "@/components/DevUI.vue";
import { addGeoOnPointsToThreejsScene, addLineFromCoordsAr, addLineFromCoordsAr1, addPolygonsFromCoordsAr } from '@/utils/ThreejsGeometryCreation';
import { ThreejsSceneOnly } from "@/utils/ThreejsSceneOnly";
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import {
  getbuildingsFromDB, getDrivingLaneFromDB, getGreeneryFromDBTexture, getGreeneryJsonFromDB, getTrafficSignalFromDB, getTreeJsonFromDB, getTreesFromDB, getWaterFromDB, getTrafficSignalDataFromDB,getbuildingsDataFromDB
} from "../service/backend.service";
import { ThreejsScene } from "@/utils/ThreejsScene";
import type { FeatureCollection } from "@turf/helpers";
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);
let threeJsScene: any;

const emit = defineEmits(["addLayer", "addImage", "triggerRepaint"]);
const populateMap = async () => {
  // await sendBuildingRequest();
  await createEmptyThreeJsScene();
  await sendBuildingRequestTHREE()
  // await sendGreeneryRequest();
  await sendGreeneryRequestTHREE();
  // await sendTrafficSignalRequest();
  await sendTrafficSignalRequestTHREE();
  //  await sendDrivingLaneRequest();
  await sendDrivingLaneRequestTHREE();
  await sendTreeRequest();
  await sendWaterRequestTHREE();
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

const sendBuildingRequestTHREE = async () => {
  const buildingData = await getbuildingsDataFromDB(store.state.aoi.projectSpecification.project_id);
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: buildingData,
    color: ['#C8D6E8', '#A5B1C2', '#BAC3C9'],
    height: 0,
    extrude: .99
  })
  // let colorPalette = ['#F3E6D6', '#DED4C6', '#EEE9E2'];//yellowish
  //  const colorPalette = ['#C8D6E8', '#A5B1C2', '#BAC3C9'];//blueish
  // const colorPalette = ['#E9B9B9', '#EBC8BC', '#F5C4BE'];//redish
};
const sendBuildingRequest = async () => {
  const newLayer = await getbuildingsFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequest = async () => {
  const newLayer = await getGreeneryFromDBTexture(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequestTHREE = async () => {
  const greeneryJson: FeatureCollection = await getGreeneryJsonFromDB(store.state.aoi.projectSpecification.project_id);
  // console.log(greeneryJson)
  
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: greeneryJson,
    color: "#9EBB64",
    height: 0,
    extrude: 0.1
  })
  

};
const sendWaterRequestTHREE = async () => {
  const waterJson: FeatureCollection = await getWaterFromDB(store.state.aoi.projectSpecification.project_id);
  // console.log(waterJson)
  
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: waterJson,
    color: "#64A4BB",
    height: 0,
    extrude: 0.12
  })
  

};
const createAoiPlane = async () => {
  // console.log("AOIPlane")
  const data: FeatureCollection = {
    'type': 'FeatureCollection',//redo as polygon..be smart
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': 
          [[[store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin],
          [store.state.aoi.projectSpecification.bbox.xmax, store.state.aoi.projectSpecification.bbox.ymin],
          [store.state.aoi.projectSpecification.bbox.xmax, store.state.aoi.projectSpecification.bbox.ymax],
          [store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymax]]]
        },
        'properties': {}
      }
    ]
  }
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: data,
    color: "#E8E8E8",
    height: 0,
    extrude: 0
  })
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


const sendDrivingLaneRequestTHREE = async () => {
  const drivingLanedata: {lane:FeatureCollection, polygon: FeatureCollection} = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)
  // console.log(drivingLanedata.lane)
  addPolygonsFromCoordsAr({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: drivingLanedata.polygon,
    color: "#262829",
    height: 0,
    extrude: 0.15
  })
  addLineFromCoordsAr1({
    scene: threeJsScene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: drivingLanedata.lane,
    color: "#ffffff",
    height: 0.15,
    extrude: .3
  })

}
const sendDrivingLaneRequest = async () => {
  const drivingLanedata = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)

  store.commit("map/addSource", {
    id: "driving_lane_polygon",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.polygon
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
      "data": drivingLanedata.lane
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
const sendTrafficSignalRequestTHREE = async () => {

  const trafficSignalData = await getTrafficSignalDataFromDB(store.state.aoi.projectSpecification.project_id);
  addGeoOnPointsToThreejsScene(threeJsScene, trafficSignalData, "TrafficLight.glb", store.state.aoi.projectSpecification.bbox)
}
</script>

<style scoped>

</style>