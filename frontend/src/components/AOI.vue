<template>
  <DevUI @startPopulate="populateMap()" v-if="devMode" />
</template>

<script lang="ts" setup>
import DevUI from "@/components/DevUI.vue";
import { addGeoOnPointsToThreejsScene, addLineFromCoordsAr1, addPolygonsFromCoordsAr } from '@/utils/ThreejsGeometryCreation';
import { ThreejsSceneOnly } from "@/utils/ThreejsSceneOnly";
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import {

  getbuildingsFromDB,
  getDrivingLaneFromDB,
  getGreeneryFromDBTexture,
  getGreeneryJsonFromDB,
  getTrafficSignalFromDB,
  getTreeJsonFromDB,
  getTreesFromDB,
  getWaterFromDB,
  getTrafficSignalDataFromDB,
  getbuildingsDataFromDB,
  getTramLineDataFromDB,
  getAmenities,
  getAmenityDataFromDB,
  getSidewalkFromDB,
  getBikeFromDB

} from "../service/backend.service";
import type { FeatureCollection } from "@turf/helpers";
const store = useStore();
const devMode = computed(() => store.getters["ui/devMode"]);
let threeJsScene3d: any;
let threeJsSceneFlat: any;

const emit = defineEmits(["addLayer", "addImage", "triggerRepaint"]);
const populateMap = async () => {
  // await sendBuildingRequest();
  await createEmptyThreeJsScene();

  await sendBuildingRequestTHREE()
  // await sendGreeneryRequest();
  await addAmenities();
  await sendGreeneryRequestTHREE();
  // await sendTrafficSignalRequest();
  await sendTrafficSignalRequestTHREE();
  //  await sendDrivingLaneRequest();
  await sendDrivingLaneRequestTHREE();
  await sendTreeRequest();
  await sendWaterRequestTHREE();
  await createAoiPlane();
  // await sendTramLineRequest();
  await sendTramLineRequestTHREE();
  emit("addLayer", threeJsScene3d.layer)
  emit("addLayer", threeJsSceneFlat.layer, "routes")
  await sendSidewalkRequest();
  await sendBikeRequest()

  store.dispatch("aoi/setMapIsPopulated");
  store.commit("ui/aoiMapPopulated", true);
}

onMounted(() => {
  populateMap();
})
const createEmptyThreeJsScene = async () => {
  threeJsScene3d = await ThreejsSceneOnly(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin, "threeJsScene3d")
  threeJsSceneFlat = await ThreejsSceneOnly(store.state.aoi.projectSpecification.bbox.xmin, store.state.aoi.projectSpecification.bbox.ymin, "threeJsSceneFlat")
}

const sendBuildingRequestTHREE = async () => {
  const buildingData = await getbuildingsDataFromDB(store.state.aoi.projectSpecification.project_id);
  addPolygonsFromCoordsAr({
    scene: threeJsScene3d.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: buildingData,
    color: ['#C8D6E8', '#A5B1C2', '#BAC3C9'],
    height: 0,
    extrude: .99
  })
};
const sendBuildingRequest = async () => {
  const newLayer = await getbuildingsFromDB(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const addAmenities =  async () => {
  const amenityData =  await getAmenityDataFromDB(store.state.aoi.projectSpecification.project_id);
  const amenitiesAr: string[] = []
  const groupedAmenities: [{"type": string , "featureCollection":FeatureCollection}]= []
  // debugger
  amenityData.features.forEach((feat)=>{
    // console.log(amenitiesAr.includes(feat.properties?.amenity))
    if(!amenitiesAr.includes(feat.properties?.amenity)){
      amenitiesAr.push(feat.properties?.amenity)
      groupedAmenities.push({type : feat.properties?.amenity, featureCollection: {type: "FeatureCollection", features:[]}})
    }
    groupedAmenities.forEach((anem)=>{
      if(anem.type == feat.properties?.amenity){
        anem.featureCollection.features.push(feat)
      }
    })
  })
  // console.log(groupedAmenities)
  groupedAmenities.forEach((anemity) =>{
    addGeoOnPointsToThreejsScene(threeJsScene3d.scene,anemity.featureCollection,"poiIcons/"+anemity.type+".glb",store.state.aoi.projectSpecification.bbox,[40,40],true)
  
  })
  // emit("addLayer", amenityData.amenityIconlayer);
  // emit("addLayer", amenityData.amenityTextlayer);

};
const sendGreeneryRequest = async () => {
  const newLayer = await getGreeneryFromDBTexture(store.state.aoi.projectSpecification.project_id);
  emit("addLayer", newLayer);

};
const sendGreeneryRequestTHREE = async () => {
  const greeneryJson: FeatureCollection = await getGreeneryJsonFromDB(store.state.aoi.projectSpecification.project_id);
  // console.log(greeneryJson)

  addPolygonsFromCoordsAr({
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: greeneryJson,
    color: "#9EBB64",
    height: 0,
    extrude: 0.15
  })


};
const sendWaterRequestTHREE = async () => {
  const waterJson: FeatureCollection = await getWaterFromDB(store.state.aoi.projectSpecification.project_id);
  // console.log(waterJson)

  addPolygonsFromCoordsAr({
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: waterJson,
    color: "#64A4BB",
    height: 0,
    extrude: 0.2
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
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: data,
    color: "#E8E8E8",
    height: 0,
    extrude: 0
  })
}
const sendTreeRequest = async () => {

  const treeJson: FeatureCollection = await getTreeJsonFromDB(store.state.aoi.projectSpecification.project_id);

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
    addGeoOnPointsToThreejsScene(threeJsScene3d.scene, partJson, "TreeVariants/" + tree, store.state.aoi.projectSpecification.bbox, [0.7, 0.8], true)

  })

}


const sendDrivingLaneRequestTHREE = async () => {
  const drivingLanedata: { lane: FeatureCollection, polygon: FeatureCollection } = await getDrivingLaneFromDB(store.state.aoi.projectSpecification.project_id)
  // console.log(drivingLanedata.lane)
  addPolygonsFromCoordsAr({
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: drivingLanedata.polygon,
    color: "#262829",
    height: 0,
    extrude: 0.3
  })
  store.commit("map/addSource", {
    id: "driving_lane",
    geojson: {
      "type": "geojson",
      "data": drivingLanedata.lane
    }
  })
  let baseWidth = 0.2;
  let baseZoom = 15;
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
      //'line-width': 1,
      "line-width": 
            {
                'type': 'exponential',
                'base': 2,
                'stops': [
                    [0, baseWidth * Math.pow(2, (0 - baseZoom))],
                    [22, baseWidth * Math.pow(2, (22 - baseZoom))]
                ]
            },
      'line-dasharray': [4,20]
    }
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

const sendTramLineRequestTHREE = async () => {


  const tramLaneData = await getTramLineDataFromDB(store.state.aoi.projectSpecification.project_id);
  addLineFromCoordsAr1({
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: tramLaneData.data,
    color: "#676767",
    height: 0.2,
    extrude: .12
  })

}
const sendTramLineRequest = async () => {


  const tramLaneData = await getTramLineDataFromDB(store.state.aoi.projectSpecification.project_id);
  store.commit("map/addSource", {
    id: "tram_line",
    geojson: {
      type: "geojson",
      data: tramLaneData.data,
    },
  });
  store.commit("map/addLayer", {
    id: "tram_line",
    type: "line",
    source: "tram_line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#FFFF00",
      "line-width": 2

    },
  });

}

const sendTrafficSignalRequestTHREE = async () => {

  const trafficSignalData = await getTrafficSignalDataFromDB(store.state.aoi.projectSpecification.project_id);
  addGeoOnPointsToThreejsScene(threeJsScene3d.scene, trafficSignalData, "TrafficLight.glb", store.state.aoi.projectSpecification.bbox)
}

const sendSidewalkRequest = async () =>{
  
  const sidewalkData = await getSidewalkFromDB(store.state.aoi.projectSpecification.project_id)
  addPolygonsFromCoordsAr({
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: sidewalkData.data,
    color: "#bdb8aa",
    height: 0,
    extrude: 0.25
  })
}

const sendBikeRequest = async () =>{
  
  const bikeData = await getBikeFromDB(store.state.aoi.projectSpecification.project_id)
  addPolygonsFromCoordsAr({
    scene: threeJsSceneFlat.scene,
    bbox: store.state.aoi.projectSpecification.bbox,
    geoJson: bikeData.data,
    color: "#f75d52",
    height: 0,
    extrude: 0.32
  })  
   
}
</script>

<style scoped>

</style>