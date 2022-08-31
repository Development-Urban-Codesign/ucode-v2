import { PolygonLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { MapboxLayer } from '@deck.gl/mapbox';
import { HTTP } from '../utils/http-common.js';
import store from "../store/store";


export async function getbuildingsFromDB() {
  const response = await HTTP.get('get-buildings-from-db');
  console.log(response);
  return new MapboxLayer({
    id: 'overpass_buildings',
    type: PolygonLayer,
    data: response.data.features,
    getPolygon: d => d.geometry.coordinates,
    opacity: 1,
    stroked: false,
    filled: true,
    extruded: true,
    wireframe: false,
    getElevation: f => f.properties.estimatedheight,
    getFillColor: [235, 148, 35, 255],
    getLineColor: [0, 0, 0],
    wireframe: true,
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
      'fill-pattern':  'https://raw.githubusercontent.com/KonstiDoll/ucode-v2/master/frontend/src/assets/grasspattern.png'
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
    scenegraph:
    "https://raw.githubusercontent.com/QSafariallahkheili/ligfinder_refactor/master/Icon3d.glb",
    getPosition: d => d.geometry.coordinates,
    getOrientation: (d) => [0, Math.random() * 180, 90],
    sizeScale: 15,
    _lighting: "pbr",
    onClick: ({ x, y, object }) => {
      // TODO: change the color of clicked icon
      getClickedCommentObject(object)
    },
    
    onHover: (e) => {
      if (e.object) {
        
        
      }
    }

  })
  
  const getClickedCommentObject = (object)=>{
    //iconlayer.setProps({sizeScale: 20})
    store.commit("comment/setCommentToggle")
    store.commit("comment/getClickedCommentObject", object)

  }

  return iconlayer
  
}

export async function getTreesFromOSM(bbox) {
  HTTP
    .post('get-trees-from-osm', {
      bbox: bbox
    })
}

export async function getTreesFromDB() {
  const response = await HTTP.get('get-trees-from-db');
  const treeLayer = new MapboxLayer({
    id: 'trees',
    type: ScenegraphLayer,
    data:response.data.features,
    pickable: false,
    scenegraph: "https://raw.githubusercontent.com/QSafariallahkheili/ligfinder_refactor/master/GenericNewTree.glb",
    getPosition: d => d.geometry.coordinates,
    getOrientation: (d) => [0, 0, 90],
    sizeScale: 7,
    _lighting: "pbr",
  })

  return treeLayer
}