import { PolygonLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { MapboxLayer } from '@deck.gl/mapbox';
import { HTTP } from '../utils/http-common.js';
import store from "../store/store";

export async function getQuestsFromDB(){
  const response = await HTTP.get('get-quests-from-db');
  // console.log(response.data);
  return response.data
}
export async function getbuildingsFromDB() {
  const response = await HTTP.get('get-buildings-from-db');
  const emptygeom = d => d.geometry.coordinates.length== 1;
  const nonEmptyFeatures = response.data.features.filter(emptygeom);
  const colorPalette = [[123, 222, 242, 255], [178, 247, 239, 255],[239, 247, 246,255], [247, 214, 224, 255], [242, 181, 211,255]];

  return new MapboxLayer({
    id: 'overpass_buildings',
    type: PolygonLayer,
    data: nonEmptyFeatures,
    getPolygon: d => d.geometry.coordinates,
    stroked: false,
    filled: true,
    extruded: true,
    getElevation: f => f.properties.estimatedheight,
    getFillColor: d => {
      if (d.properties.estimatedheight<=4){
        return colorPalette[0]
      }
      else if (d.properties.estimatedheight>4 && d.properties.estimatedheight<=8){
        return colorPalette[1]
      }
      else if (d.properties.estimatedheight>8 && d.properties.estimatedheight<=12){
        return colorPalette[2]
      }
      else if (d.properties.estimatedheight>12 && d.properties.estimatedheight<=16){
        return colorPalette[3]
      }
      else {
        return colorPalette[4]
      }
      
    },
    getLineColor: [0, 0, 0, 0],
    wireframe: false,
    pickable: true,
  })
}

export async function getbuildingsFromOSM(bbox) {
  HTTP
    .post('get-buildings-from-osm', {
      bbox: bbox
    }).then(() => store.dispatch("aoi/setDataIsLoaded"))
}
export async function getGreeneryFromDB() {
  const response = await HTTP.get('get-greenery-from-db')
  console.log(response);
  return new MapboxLayer({
    id: 'overpass_greenery',
    type: PolygonLayer,
    data: response.data.features,
    getPolygon: d => d.geometry.coordinates,
    opacity: 1,
    stroked: false,
    filled: true,
    extruded: false,
    wireframe: false,
    getFillColor: [102, 158, 106, 255],
    pickable: true,
  })
}
export async function getGreeneryFromDBTexture() {
  const response = await HTTP.get('get-greenery-from-db')
  console.log(response);
  return ({
    id: 'overpass_greenery',
    type: "fill",
    source: {
      'type': 'geojson',
      'data': response.data},
    paint:{
      'fill-pattern':  'grasspattern.png'
    }
  })
}
export async function storeGreeneryFromOSM(bbox, usedTagsForGreenery) {
  HTTP
    .post('store-greenery-from-osm', {
      bbox: bbox,
      usedTagsForGreenery: usedTagsForGreenery
    }).then(() => store.dispatch("aoi/setDataIsLoaded"))
}


export async function getCommentsFromDB() {
  const response = await HTTP.get('get-cooments')

  const iconlayer = new MapboxLayer({
    id: 'comments',
    type: ScenegraphLayer,
    data:response.data.features,
    pickable: true,
    pickingRadius: 100,
    scenegraph: "./Icon3d.glb",
    getPosition: d => d.geometry.coordinates,
    getOrientation: (d) => [0, 0, 90],
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
      store.commit("pulse/pulsedata", object)
      store.commit("comment/setCommentToggle")
      store.commit("comment/getClickedCommentObject", object)
    
      //getClickedCommentObject(object)
    },
  
    onHover: (e) => {
      if (e.object) {
        
      }
    }

  })
  return iconlayer
  
}

export async function getTreesFromOSM(bbox) {
  HTTP
    .post('get-trees-from-osm', {
      bbox: bbox
    }).then(() => store.dispatch("aoi/setDataIsLoaded"))
}

export async function getTreesFromDB() {
  const response = await HTTP.get('get-trees-from-db');
  const treeLayer = new MapboxLayer({
    id: 'trees',
    type: ScenegraphLayer,
    data:response.data.features,
    pickable: false,
    scenegraph: "Tree1.glb",
    getPosition: d => d.geometry.coordinates,
    getOrientation: (d) => [0, 0, 90],
    sizeScale: 1,
    _lighting: "pbr",
  })

  return treeLayer
}

export async function getTreeJsonFromDB() {
  const response = await HTTP.get('get-trees-from-db');
  const trees = response.data
  return trees
}


export async function getDrivingLaneFromOSM(bbox) {
  HTTP
    .post('get-driving-lane-from-osm', {
      bbox: bbox
    }).then(() => store.dispatch("aoi/setDataIsLoaded"))
}

export async function getDrivingLaneFromDB() {
  const response = await HTTP.get('get-driving-lane-from-db');
  return response
}
