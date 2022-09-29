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
export async function getbuildingsFromDB(projectId) {
  const response = await HTTP.post('get-buildings-from-db',projectId);
  const emptygeom = d => d.geometry.coordinates.length== 1;
  const nonEmptyFeatures = response.data.features.filter(emptygeom);
  //const colorPalette = [[123, 222, 242, 255], [178, 247, 239, 255],[239, 247, 246,255], [247, 214, 224, 255], [242, 181, 211,255]];
  //const colorPalette = [[232, 222, 197, 255], [237, 236, 221, 255], [255, 241, 230, 255], [235, 237, 232, 255], [237, 220, 210, 255], [235, 238, 240, 255]];
  // Color palette values from Apple Maps
  const colorPalette = [[194, 224, 242 ,255],[196, 226, 242 ,255],[206, 214, 216 ,255],[209, 212, 212 ,255],[210, 211, 210 ,255],[211, 217, 218 ,255],[211, 211, 210 ,255],[213, 226, 232 ,255],[214, 224, 222 ,255],[214, 215, 208 ,255],[216, 211, 214 ,255],[217, 214, 209 ,255],[217, 218, 210 ,255],[217, 218, 213 ,255],[219, 224, 226 ,255],[219, 227, 237 ,255],[220, 223, 223 ,255],[220, 220, 215 ,255],[220, 221, 218 ,255],[221, 218, 213 ,255],[221, 223, 222 ,255],[221, 223, 222 ,255],[221, 234, 237 ,255],[221, 217, 210 ,255],[222, 228, 236 ,255],[222, 224, 224 ,255],[222, 226, 222 ,255],[222, 221, 215 ,255],[222, 221, 218 ,255],[223, 224, 218 ,255],[223, 228, 230 ,255],[223, 220, 216 ,255],[223, 226, 218 ,255],[223, 226, 227 ,255],[223, 219, 212 ,255],[224, 223, 216 ,255],[224, 224, 223 ,255],[224, 223, 214 ,255],[224, 220, 212 ,255],[225, 226, 226 ,255],[225, 226, 222 ,255],[225, 228, 230 ,255],[225, 228, 230 ,255],[225, 219, 214 ,255],[226, 224, 220 ,255],[226, 230, 232 ,255],[227, 226, 223 ,255],[227, 226, 223 ,255],[227, 230, 232 ,255],[227, 224, 216 ,255],[227, 223, 220 ,255],[227, 222, 214 ,255],[227, 232, 232 ,255],[227, 232, 236 ,255],[227, 228, 227 ,255],[227, 228, 227 ,255],[227, 224, 222 ,255],[227, 230, 234 ,255],[227, 228, 220 ,255],[227, 230, 229 ,255],[227, 230, 230 ,255],[227, 224, 223 ,255],[227, 230, 231 ,255],[227, 230, 231 ,255],[227, 230, 231 ,255],[227, 230, 231 ,255],[227, 226, 218 ,255],[227, 228, 225 ,255],[228, 226, 220 ,255],[229, 230, 232 ,255],[229, 232, 233 ,255],[229, 232, 230 ,255],[229, 223, 212 ,255],[229, 226, 218 ,255],[229, 232, 231 ,255],[229, 222, 216 ,255],[229, 226, 220 ,255],[229, 232, 232 ,255],[229, 230, 229 ,255],[229, 226, 224 ,255],[229, 234, 238 ,255],[229, 234, 234 ,255],[229, 228, 222 ,255],[229, 228, 226 ,255],[229, 228, 226 ,255],[229, 230, 228 ,255],[229, 224, 216 ,255],[229, 234, 235 ,255],[230, 224, 216 ,255],[230, 230, 229 ,255],[230, 230, 224 ,255],[230, 230, 228 ,255],[230, 230, 228 ,255],[230, 230, 220 ,255],[231, 232, 230 ,255],[231, 232, 230 ,255],[231, 228, 224 ,255],[231, 232, 227 ,255],[231, 232, 227 ,255],[231, 230, 227 ,255],[231, 232, 228 ,255],[231, 223, 214 ,255],[231, 232, 232 ,255],[231, 232, 232 ,255],[231, 232, 232 ,255],[231, 230, 224 ,255],[231, 230, 228 ,255],[231, 228, 222 ,255],[232, 232, 232 ,255],[232, 226, 222 ,255],[232, 232, 227 ,255],[232, 228, 226 ,255],[232, 232, 230 ,255],[232, 232, 230 ,255],[232, 232, 230 ,255],[232, 232, 229 ,255],[233, 232, 224 ,255],[233, 232, 228 ,255],[233, 232, 228 ,255],[233, 226, 214 ,255],[233, 234, 232 ,255],[233, 234, 232 ,255],[233, 232, 232 ,255],[233, 230, 222 ,255],[233, 230, 222 ,255],[233, 230, 222 ,255],[233, 232, 226 ,255],[233, 230, 230 ,255],[233, 232, 223 ,255],[233, 230, 224 ,255],[233, 228, 226 ,255],[233, 226, 220 ,255],[233, 234, 233 ,255],[233, 236, 240 ,255],[234, 234, 230 ,255],[234, 232, 226 ,255],[234, 230, 222 ,255],[234, 234, 232 ,255],[234, 232, 228 ,255],[234, 228, 228 ,255],[235, 230, 228 ,255],[235, 228, 222 ,255],[235, 234, 231 ,255],[235, 216, 210 ,255],[235, 224, 214 ,255],[235, 215, 208 ,255],[235, 234, 228 ,255],[235, 234, 232 ,255],[235, 234, 225 ,255],[235, 234, 225 ,255],[236, 230, 224 ,255],[236, 232, 218 ,255],[236, 232, 218 ,255],[237, 236, 233 ,255],[237, 228, 214 ,255],[237, 230, 216 ,255],[237, 224, 220 ,255],[237, 232, 224 ,255],[237, 223, 214 ,255],[237, 226, 220 ,255],[237, 230, 222 ,255],[237, 230, 222 ,255],[237, 236, 234 ,255],[237, 236, 234 ,255],[238, 226, 218 ,255],[238, 234, 224 ,255],[239, 230, 214 ,255],[239, 234, 228 ,255],[239, 236, 230 ,255],[239, 236, 234 ,255],[239, 220, 214 ,255],[240, 226, 212 ,255],[240, 234, 226 ,255],[240, 236, 230 ,255],[241, 221, 228 ,255],[241, 225, 214 ,255],[241, 219, 204 ,255],[241, 236, 228 ,255],[241, 241, 239 ,255],[241, 236, 227 ,255],[242, 241, 238 ,255],[242, 231, 217 ,255],[242, 242, 238 ,255],[242, 223, 214 ,255],[243, 222, 225 ,255],[243, 238, 232 ,255],[243, 240, 236 ,255],[243, 238, 228 ,255],[243, 240, 232 ,255],[243, 238, 220 ,255],[244, 241, 231 ,255],[245, 240, 232 ,255],[245, 233, 190 ,255],[245, 242, 234 ,255],[245, 238, 231 ,255],[245, 233, 218 ,255],[246, 240, 232 ,255],[247, 231, 225 ,255],[249, 238, 232 ,255],[249, 238, 227 ,255],[250, 229, 212 ,255],[250, 238, 226 ,255],[251, 228, 220 ,255]];

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
      let lengthColors =  colorPalette.length - 1;
      return colorPalette[Math.floor((Math.random() * lengthColors))]
    },
    /*
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
      
    }, */

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
  // console.log(response);
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
export async function getGreeneryFromDBTexture(projectID) {
  const response = await HTTP.post('get-greenery-from-db',projectID)
  // console.log(response);
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
  const response = await HTTP.get('get-comments')

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
        // Show content of comment in Tooltip?
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

export async function getTreesFromDB(projectId) {
  const response = await HTTP.post('get-trees-from-db',projectId);
  const treeLayer = new MapboxLayer({
    id: 'trees',
    type: ScenegraphLayer,
    data:response.data.features,
    pickable: false,
    scenegraph: "Tree2.glb",
    getPosition: d => d.geometry.coordinates,
    getOrientation: (d) => [0, 0, 90],
    sizeScale: 1,
    _lighting: "pbr",
  })

  return treeLayer
}

export async function getDrivingLaneFromOSM(bbox) {
  HTTP
    .post('get-driving-lane-from-osm', {
      bbox: bbox
    }).then(() => store.dispatch("aoi/setDataIsLoaded"))
}

export async function getDrivingLaneFromDB(projectId) {
  const response = await HTTP.post('get-driving-lane-from-db', projectId);
  return response
}

export async function getTrafficLightsFromOSM(bbox) {
  HTTP
    .post('get-traffic-lights-from-osm', {
      bbox: bbox
  }).then(() => store.dispatch("aoi/setDataIsLoaded"))
}

export async function getTrafficSignalFromDB(projectId) {
  const response = await HTTP.post('get-traffic-signal-from-db',projectId);
  console.log(response.data)
  const trafficSignalLayer = new MapboxLayer({
    id: 'traffic-signal',
    type: ScenegraphLayer,
    data:response.data.features,
    pickable: false,
    scenegraph: "TrafficLight.glb",
    getPosition: d => d.geometry.coordinates,
    getOrientation: (d) => [0, 0, 90],
    sizeScale: 1,
    _lighting: "pbr",
  })

  return trafficSignalLayer
}
