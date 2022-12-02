<template>

  <v-col cols="6" md="2" sm="3" style="position: absolute; right: 0; top: 50px; z-index: 999">

    <v-btn color="#41b883" @click="loadAllProjectObjectsFromOSM()" class="mt-2">
      Import OSM
    </v-btn>
    <v-btn color="#41b883" @click="emit('startPopulate')" class="mt-2">
      Load DB
    </v-btn>


    <v-select :items="['get', 'retrieve']" label="building" variant="outlined" @update:modelValue="sendBuildingRequest">
    </v-select>
    <v-select :items="['get', 'retrieve']" :label="$t('AOI.greenery')" variant="outlined"
      @update:modelValue="sendGreeneryRequest"></v-select>
    <v-select :items="['get', 'retrieve']" label="tree" variant="outlined" @update:modelValue="sendTreeRequest">
    </v-select>
    <v-select :items="['get', 'retrieve']" label="driving lane" variant="outlined"
      @update:modelValue="sendDrivingLaneRequest"></v-select>
    <v-select :items="['get', 'retrieve']" label="traffic signal" variant="outlined"
      @update:modelValue="sendTrafficSignalRequest"></v-select>
    <v-select :items="['get', 'retrieve']" label="tram lines" variant="outlined"
      @update:modelValue="sendTramLineRequest"></v-select>

    <v-select :items="['get', 'retrieve']" label="water" variant="outlined"
      @update:modelValue="sendwaterRequest"></v-select>

    <v-select :items="['get', 'retrieve']" label="sidewalk" variant="outlined"
    @update:modelValue="sendSideWalkRequest"></v-select>

    <v-select :items="['get', 'retrieve']" label="bike" variant="outlined"
      @update:modelValue="sendBikeRequest"></v-select>
    <v-alert type="success" v-if="store.state.aoi.dataIsLoaded">
      stored
    </v-alert>
    <v-alert type="info" v-if="store.state.aoi.dataIsLoading">
      getting data...
    </v-alert>
  </v-col>
</template>

<script setup>
import { useStore } from "vuex";
import {
  getbuildingsFromDB,
  getbuildingsFromOSM,
  storeGreeneryFromOSM,
  getGreeneryFromDBTexture,
  getTreesFromOSM,
  getTreesFromDB,
  getDrivingLaneFromOSM,
  getDrivingLaneFromDB,
  getTrafficLightsFromOSM,
  getTrafficSignalFromDB,
  getTramLineFromOSM,
  getTramLineDataFromDB,
  getWaterFromOSM,
  getSideWalkFromOSM,
  getBikeFromOSM,
  getSidewalkFromDB

} from "../service/backend.service";

const store = useStore();
const emit = defineEmits("startPopulate")

const loadAllProjectObjectsFromOSM = async (mode) => {
  getbuildingsFromOSM(
    store.state.aoi.projectSpecification.bbox,
    store.state.aoi.projectSpecification.project_id
  );
  storeGreeneryFromOSM(
    store.state.aoi.projectSpecification.bbox,
    store.state.aoi.usedTagsForGreenery,
    store.state.aoi.projectSpecification.project_id
  );

  getTreesFromOSM(
    store.state.aoi.projectSpecification.bbox,
    store.state.aoi.projectSpecification.project_id
  );
  getDrivingLaneFromOSM(
    store.state.aoi.projectSpecification.bbox,
    store.state.aoi.projectSpecification.project_id
  );
  getTrafficLightsFromOSM(
    store.state.aoi.projectSpecification.bbox,
    store.state.aoi.projectSpecification.project_id
  );
};

const sendBuildingRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    getbuildingsFromOSM(
    store.state.aoi.projectSpecification.bbox,
    store.state.aoi.projectSpecification.project_id
  );
  } else {
    const newLayer = await getbuildingsFromDB(
      store.state.aoi.projectSpecification.project_id
    );
    await getbuildingsFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
    emit("addLayer", newLayer);
  }
};
const sendGreeneryRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await storeGreeneryFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.usedTagsForGreenery,
      store.state.aoi.projectSpecification.project_id
    );
  } else {
    const newLayer = await getGreeneryFromDBTexture(
      store.state.aoi.projectSpecification.project_id
    );
    emit("addLayer", newLayer);
  }
};

const sendTreeRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getTreesFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
  } else {
    const treeLayer = await getTreesFromDB();
    emit("addLayer", treeLayer);
  }
};
const sendDrivingLaneRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getDrivingLaneFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
    console.log(
      "Meine projectId: " + store.state.aoi.projectSpecification.project_id
    );
  } else {
    const drivingLanedata = await getDrivingLaneFromDB();
    console.log(drivingLanedata);

    store.commit("map/addSource", {
      id: "driving_lane_polygon",
      geojson: {
        type: "geojson",
        data: drivingLanedata.data.polygon,
      },
    });
    store.commit("map/addLayer", {
      id: "driving_lane_polygon",
      type: "fill",
      source: "driving_lane_polygon",
      paint: {
        "fill-color": "#888",
        "fill-opacity": 0.8,
      },
    });

    store.commit("map/addSource", {
      id: "driving_lane",
      geojson: {
        type: "geojson",
        data: drivingLanedata.data.lane,
      },
    });
    store.commit("map/addLayer", {
      id: "driving_lane",
      type: "line",
      source: "driving_lane",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#FFFFFF",
        "line-width": 1,
        "line-dasharray": [10, 20],
      },
    });
  }
};

const sendTrafficSignalRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getTrafficLightsFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
  } else {
    const trafficSignalLayer = await getTrafficSignalFromDB();
    emit("addLayer", trafficSignalLayer);
  }
};
const sendwaterRequest = async (mode) => {
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getWaterFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
  } else {
    const trafficSignalLayer = await getTrafficSignalFromDB();
    emit("addLayer", trafficSignalLayer);
  }
};

const sendTramLineRequest = async (mode) =>{
  
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getTramLineFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
  } else {
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
        "line-width": 2,
      
      },
    });
    
  }
};

const sendSideWalkRequest = async (mode)=>{
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getSideWalkFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
  } 
}

const sendBikeRequest = async (mode)=>{
  if (mode == "get") {
    store.dispatch("aoi/setDataIsLoading");
    await getBikeFromOSM(
      store.state.aoi.projectSpecification.bbox,
      store.state.aoi.projectSpecification.project_id
    );
  } 

  else {
    const sidewalkData = await getSidewalkFromDB(store.state.aoi.projectSpecification.project_id);
    store.commit("map/addSource", {
      id: "sidewalk_polygon",
      geojson: {
        type: "geojson",
        data: sidewalkData.data,
      },
    });
    store.commit("map/addLayer", {
      id: "sidewalk_polygon",
      type: "fill",
      source: "sidewalk_polygon",
      paint: {
        "fill-color": "#E1DBCB",
        "fill-opacity": 1,
      },
    });
    
  }
}
</script>