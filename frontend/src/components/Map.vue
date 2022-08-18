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
      <Contribution @addPopup="addPopupToMap" :clickedCoordinates="mapClicks.clickedCoordinates" />
    </div>
  </div>
</template>

<script setup>
import { MapboxLayer } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { Map } from "maplibre-gl";
import { onMounted, onUnmounted, reactive, shallowRef } from "vue";
import { useStore } from "vuex";
import { HTTP } from "../utils/http-common";
import { TreeModel } from "../utils/TreeModel";
import AOI from "./AOI.vue";
import Contribution from "./Contribution.vue";

const store = useStore();

const mapContainer = shallowRef(null);
let map = {};
const mapClicks = reactive({ clickedCoordinates: [] })

let unsubscribeFromStore = () => { };

onUnmounted(() => {
  unsubscribeFromStore()
})

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
  map.on('click', function (mapClick) {
    mapClicks.clickedCoordinates = [mapClick.lngLat.lng, mapClick.lngLat.lat]
  });

  unsubscribeFromStore = store.subscribe((mutation, state) => {
    if (mutation.type === "map/addLayer") {
      state.map.layers?.map(addLayerToMap)
    }
    if (mutation.type === "map/addSource") {
      state.map.sources?.map(addSourceToMap)
    }
  });
});

// threejs layer
const addThreejsShape = () => {
  addLayerToMap(TreeModel(13.74647, 51.068646, 100));
};

const addLayerToMap = (layer) => {
  if (!layer) return;
  if (layer.paint) {
    if (layer.paint["fill-pattern"]) {
      addImageToMap(layer.paint["fill-pattern"]);
    }
  }
  map?.addLayer(layer);
};

const removeLayerFromMap = (layerId) => {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

const addSourceToMap = (source) => {
  if (!source) return;
  if (!map) return;
  //TODO extract this as a function parameter
  const sourceId = "comment";
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
    removeLayerFromMap(sourceId)
  }

  map.addSource(sourceId, source);
};
const addImageToMap = (ImgUrl) => {
  if (!ImgUrl) return;
  map?.loadImage(ImgUrl, (error, image) => {
    if (error) throw error;
    map?.addImage(ImgUrl, image);
  });
};

// deckgl layder
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

const addPopupToMap = (popup) => {
  popup?.addTo(map)
}

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