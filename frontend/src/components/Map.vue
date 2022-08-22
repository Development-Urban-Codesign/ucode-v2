<template>
  <div class="map-wrap" ref="mapContainer">
    <div class="map" id="map">
      <v-row style="position: absolute; right: 20px; top: 20px; z-index: 999">
        <v-btn color="error" class="ml-2" @click="addThreejsShape">
          Threejs
        </v-btn>
        <v-btn color="success" class="ml-2" @click="addDeckglShape">
          Deckgl
        </v-btn>
      </v-row>

      <AOI @addLayer="addLayerToMap" @addImage="addImageToMap" />
      <Contribution />
      <Quests />
    </div>
  </div>
</template>

<script setup>
import { Map } from "maplibre-gl";
import { shallowRef, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";
import { TreeModel } from "../utils/TreeModel";
import { MapboxLayer } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import AOI from "./AOI.vue";
import Contribution from "./Contribution.vue";
import Quests from "./Quests.vue";


const store = useStore();

const mapContainer = shallowRef(null);
let map = {};

onMounted(() => {
  map = new Map({
    container: mapContainer.value,
    style: store.state.map.style,
    center: [store.state.map.center.lng, store.state.map.center.lat],
    zoom: store.state.map.zoom,
    minZoom: store.state.map.minZoom,
    maxZoom: store.state.map.maxZoom,
    maxPitch: store.state.map.maxPitch,
  });
  map.on("load", function () {
    HTTP.get("").then((response) => {
      console.log(response);
    });
  });
});

// threejs layer
const addThreejsShape = () => {
  addLayerToMap(TreeModel(13.74647, 51.068646, 100));
}
const addLayerToMap = (layer) => {
  if (!layer) return;
  if (layer.paint) {
    if (layer.paint["fill-pattern"]) {
      addImageToMap(layer.paint["fill-pattern"]);
    }
  }
  map?.addLayer(layer);
};
const addImageToMap = (ImgUrl) => {
  if (!ImgUrl) return;
  map?.loadImage(ImgUrl, (error, image) => {
    if (error) throw error;
    map?.addImage(ImgUrl, image);
  }); 
};

// deckgl layer
const addDeckglShape = () => {
  const myDeckLayer = new MapboxLayer({
    id: "hexagon2D",
    type: ScenegraphLayer,
    data: [13.755453, 51.067814],
    pickable: true,
    scenegraph:
      "https://raw.githubusercontent.com/QSafariallahkheili/ligfinder_refactor/master/GenericNewTree.glb",
    getPosition: [13.755453, 51.067814],
    getOrientation: (d) => [0, Math.random() * 180, 90],
    sizeScale: 50,
    _lighting: "pbr",
  });
  addLayerToMap(myDeckLayer);
};

onUnmounted(() => {
  map?.remove();
});
</script>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map {
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: darkgray;
  margin: auto;
}

.watermark {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 999;
}
</style>