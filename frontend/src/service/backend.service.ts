import { PolygonLayer } from "@deck.gl/layers/typed";
import { MapboxLayer } from "@deck.gl/mapbox/typed";
import { ScenegraphLayer } from "@deck.gl/mesh-layers/typed";
import store from "@/store/store";
import { HTTP } from "@/utils/http-common.js";
import type { BoundingBox } from "@/store/modules/aoi"
import { PROJECTION_MODE } from "@deck.gl/core/typed/lib/constants";
import * as turf from '@turf/turf';
import { IconLayer, TextLayer } from '@deck.gl/layers/typed';
import type { Feature, FeatureCollection, Geometries } from "@turf/turf";


export async function getQuestsFromDB(projectId: string) {
  const response = await HTTP.post("get-quests-from-db", projectId);
  return response.data;
}
export async function getbuildingsDataFromDB(projectId: string) {
  const response = await HTTP.post("get-buildings-from-db", projectId);
  return response.data;
}
export async function getAmenityDataFromDB(projectId: string) {
  const response = await HTTP.post("get-buildings-from-db", projectId);
  const detectAmenities = (d: Feature) => d?.properties?.amenity != null;
  const amenities = response.data.features.filter(detectAmenities);
  // console.log(amenities)

  const amenity_tags = ["Theatre", "arts_center", "clinic", "townhall", "library",  "place_of_worship", "cinema"]
  let amenityGeojson: FeatureCollection = {type: "FeatureCollection", features: []}
  amenities.forEach((feat: Feature<Geometries>) => {
    if (feat.geometry?.coordinates.length == 1 && amenity_tags.includes(feat.properties?.amenity)) {
      let centroid = turf.centroid((feat.geometry))
      centroid.properties = feat.properties
      amenityGeojson.features.push(centroid)
      // console.log(turf.centroid((feat.geometry)))
    }
  });
  console.log(amenityGeojson)
  return amenityGeojson;

}

export async function getbuildingsFromDB(projectId: string) {
  const response = await HTTP.post("get-buildings-from-db", projectId);
  // @ts-ignore

  const emptygeom = (d: Feature) => d?.geometry?.coordinates?.length == 1;
  const nonEmptyFeatures = response.data.features.filter(emptygeom);
  // const colorPalette = ['#7bdef2', '#b2f7ef','#eff7f6', '#f7d6e0', '#f2b5d3'];
  
  const detectAmenities = (d: Feature) => d?.properties?.amenity != null;
  const amenities = response.data.features.filter(detectAmenities);
  console.log(amenities)

  for (let feat of amenities) {
    if (feat.geometry.coordinates.length == 1) {
      let centroid = turf.centroid((feat.geometry))
      centroid.properties = feat.properties
      amenityGeojson.push(centroid)
      //console.log(turf.centroid((feat.geometry)))
    }
  }
  //console.log(amenityGeojson)
  //emit("addLayer", newLayer);
  const colorPalette = ['#f7f3ee', '#f8f2e9', '#f7f3ee', '#EEE9E2', '#f7f3ee'];

  const randomColoreFromColorPalette = () => {
    const lengthColors = colorPalette.length - 1;
    return colorPalette[Math.floor(Math.random() * lengthColors)];
  }
  // @ts-ignore
  response.data.features.forEach((feature) => {
    feature.properties.color = randomColoreFromColorPalette();

  })

  return {
    id: "overpass_buildings",
    type: 'fill-extrusion',
    source: {
      type: "geojson",
      data: response.data
    },
    paint: {
      'fill-extrusion-color': ["get", 'color'],
      'fill-extrusion-height': ["get", "estimatedheight"],
      'fill-extrusion-opacity': 1
    }
  }
  /*return new MapboxLayer({
    id: "overpass_buildings",
    // @ts-ignore
    type: PolygonLayer,
    data: nonEmptyFeatures,
    // @ts-ignore
    getPolygon: (d:Feature) => d.geometry.coordinates,
    stroked: false,
    filled: true,
    extruded: true,
    getElevation: (feature: Feature) => feature.properties.estimatedheight,
    getFillColor: (d: Feature) => {
      const lengthColors = colorPalette.length - 1;
      return colorPalette[Math.floor(Math.random() * lengthColors)];
    },
    getLineColor: [0, 0, 0, 0],
    wireframe: false,
    pickable: true,
    //extensions: [new BuildingFilter()],
  });*/

}

export async function getAmenities() {
  const ICON_MAPPING = {
    marker: { x: 0, y: 0, width: 128, height: 128, mask: true }
  };

  const amenityIconlayer = new MapboxLayer({
    id: 'amenity-icon-layer',
    // @ts-ignore
    type: IconLayer,
    data: amenityGeojson,
    pickable: true,
    iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping: ICON_MAPPING,
    getIcon: (d:Feature) => 'marker',
    sizeScale: 5,
    //sizeUnits: "meters",
     // @ts-ignore
    getPosition: (d:Feature) => [...d.geometry.coordinates, d.properties.estimatedheight+20],
    getSize: 5,
    getColor: [255,0,0,255],
   
  },
  ) 
  const amenityTextlayer = new MapboxLayer({
    id: 'amenity-text-layer',
    // @ts-ignore
    type: TextLayer,
    data: amenityGeojson,
    pickable: true,
    // @ts-ignore
    getPosition: (d:Feature) => [...d.geometry.coordinates, d.properties.estimatedheight+20],
    getText:(d:Feature) => d.properties.amenity,
    getSize: 10,
    //sizeUnits: "meters",
    getAngle: 0,
    getTextAnchor: 'start',
    getAlignmentBaseline: 'bottom',
    
  })
  
  return {amenityIconlayer, amenityTextlayer}
}

export async function getbuildingsFromOSM(bbox: BoundingBox, projectId: string) {
  HTTP.post("get-buildings-from-osm", {
    bbox: bbox,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}
export async function getGreeneryFromDB() {
  const response = await HTTP.get("get-greenery-from-db");
  // console.log(response);
  return new MapboxLayer({
    id: "overpass_greenery",
    // @ts-ignore
    type: PolygonLayer,
    data: response.data.features,
    // @ts-ignore
    getPolygon: (d: Feature) => d.geometry.coordinates,
    opacity: 1,
    stroked: false,
    filled: true,
    extruded: false,
    wireframe: false,
    getFillColor: [102, 158, 106, 255],
    pickable: true,
  });
}

export async function getGreeneryFromDBTexture(projectId: string) {
  const response = await HTTP.post("get-greenery-from-db", projectId);
  // console.log(response);
  return {
    id: "overpass_greenery",
    type: "fill",
    source: {
      type: "geojson",
      data: response.data,
    },
    paint: {
      "fill-pattern": "grasspattern.png",
    },
  };
}
export async function storeGreeneryFromOSM(
  bbox: BoundingBox,
  usedTagsForGreenery: unknown[],
  projectId: string
) {
  HTTP.post("get-greenery-from-osm", {
    bbox: bbox,
    usedTagsForGreenery: usedTagsForGreenery,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}

//TH
export async function getFilteredCommentsFromDB(projectId: string, userId: string) {
  const response = await HTTP.post("get-filtered-comments", {
    projectId: projectId,
    userId: userId});
    const iconlayer = new MapboxLayer({
      id: "comments",
      // @ts-ignore
      type: ScenegraphLayer,
      data: response.data.features,
      pickable: true,
      pickingRadius: 100,
      scenegraph: "./Icon3d.glb",
      // @ts-ignore
      getPosition: (d) => d.geometry.coordinates,
      getOrientation: () => [0, 0, 90],
      sizeScale: 15,
      _lighting: "pbr",
      onClick: ({ x, y, object }) => {
        // TODO: change the color of clicked icon
        /*store.commit("map/addLayer", new MapboxLayer({
          id: 'pulse-layerr',
          type: ScatterplotLayer,
          data : object.geometry.coordinates,
          pickable: true,
          stroked: false,
          filled: true,
          radiusUnits : 'meters',
          antialiasing: true,
          getPosition: object.geometry.coordinates,
          getRadius: 0,
          radiusScale: 1,
          getFillColor: d => [0, 255, 0, 255],
          getLineColor: d => [0, 0, 0],
        }))*/
        store.commit("pulse/pulsedata", object);
        store.commit("comment/setCommentToggle");
        store.commit("comment/getClickedCommentObject", object);
  
        //getClickedCommentObject(object)
      },
  
      onHover: (e) => {
        if (e.object) {
          // Show content of comment in Tooltip?
        }
      },
    });
    return iconlayer;
  }


export async function getCommentsFromDB(projectId: string) {
  const response = await HTTP.post("get-comments", projectId);

  const iconlayer = new MapboxLayer({
    id: "comments",
    // @ts-ignore
    type: ScenegraphLayer,
    data: response.data.features,
    pickable: true,
    pickingRadius: 100,
    scenegraph: "./Icon3d.glb",
    // @ts-ignore
    getPosition: (d) => d.geometry.coordinates,
    getOrientation: () => [0, 0, 90],
    sizeScale: 15,
    _lighting: "pbr",
    onClick: ({ x, y, object }) => {
      // TODO: change the color of clicked icon
      /*store.commit("map/addLayer", new MapboxLayer({
        id: 'pulse-layerr',
        type: ScatterplotLayer,
        data : object.geometry.coordinates,
        pickable: true,
        stroked: false,
        filled: true,
        radiusUnits : 'meters',
        antialiasing: true,
        getPosition: object.geometry.coordinates,
        getRadius: 0,
        radiusScale: 1,
        getFillColor: d => [0, 255, 0, 255],
        getLineColor: d => [0, 0, 0],
      }))*/
      store.commit("pulse/pulsedata", object);
      store.commit("comment/setCommentToggle");
      store.commit("comment/getClickedCommentObject", object);

      //getClickedCommentObject(object)
    },

    onHover: (e) => {
      if (e.object) {
        // Show content of comment in Tooltip?
      }
    },
  });
  return iconlayer;
}

export async function getTreesFromOSM(bbox: BoundingBox, projectId: string) {
  HTTP.post("get-trees-from-osm", {
    bbox: bbox,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}
export async function getTreeJsonFromDB(projectId: string) {
  const response = await HTTP.post("get-trees-from-db", projectId);
  const trees = response.data
  return trees
}
export async function getGreeneryJsonFromDB(projectId: string) {
  const response = await HTTP.post("get-greenery-from-db", projectId);
  return response.data
}
export async function getTreesFromDB(projectId: string) {
  const response = await HTTP.post("get-trees-from-db", projectId);
  const treeLayer = new MapboxLayer({
    id: "trees",
    // @ts-ignore
    type: ScenegraphLayer,
    data: response.data.features,
    pickable: false,
    scenegraph: "Tree2.glb",
    // @ts-ignore
    getPosition: (d: Feature) => d.geometry.coordinates,
    getOrientation: () => [0, 0, 90],
    sizeScale: 1,
    _lighting: "pbr",
  });

  return treeLayer;
}

export async function getDrivingLaneFromOSM(bbox: BoundingBox, projectId: string) {
  console.log("Backend-ProjectID: " + projectId)
  HTTP.post("get-driving-lane-from-osm", {
    bbox: bbox,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}

export async function getDrivingLaneFromDB(projectId: string) {
  const response = await HTTP.post("get-driving-lane-from-db", projectId);
  return response.data;
}
export async function getWaterFromDB(projectId: string) {
  const response = await HTTP.post("get-water-from-db", projectId);
  return response.data;
}

export async function getTrafficLightsFromOSM(bbox: BoundingBox, projectId: string) {
  HTTP.post("get-traffic-lights-from-osm", {
    bbox: bbox,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}

export async function getTrafficSignalDataFromDB(projectId: string) {
  const response = await HTTP.post("get-traffic-signal-from-db", projectId);
  return response.data
}

export async function getTrafficSignalFromDB(projectId: string) {
  const response = await HTTP.post("get-traffic-signal-from-db", projectId);
  const trafficSignalLayer = new MapboxLayer({
    id: "traffic-signal",
    // @ts-ignore
    type: ScenegraphLayer,
    data: response.data.features,
    pickable: false,
    scenegraph: "TrafficLight.glb",
    // @ts-ignore
    getPosition: (d: Feature) => d.geometry.coordinates,
    getOrientation: () => [0, 0, 90],
    sizeScale: 1,
    _lighting: "pbr",
  });

  return trafficSignalLayer;
}

export async function getRoutesFromDB(projectId: string) {
  const response = await HTTP.post("get-routes-from-db", projectId);
  return response;
}

export async function getTramLineFromOSM(bbox: BoundingBox, projectId: string) {
  HTTP.post("get-tram-lines-from-osm", {
    bbox: bbox,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}

export async function getTramLineDataFromDB(projectId: string) {
  const response = await HTTP.post("get-tram-line-from-db", projectId);
  return response;
}

export async function getWaterFromOSM(bbox: BoundingBox, projectId: string) {
  HTTP.post("get-water-from-osm", {
    bbox: bbox,
    projectId: projectId,
  }).then(() => store.dispatch("aoi/setDataIsLoaded"));
}