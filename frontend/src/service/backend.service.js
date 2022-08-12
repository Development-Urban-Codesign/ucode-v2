import { PolygonLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';
import { HTTP } from '../utils/http-common.js';

export async function getbuildingsFromDB() {
  const response = await HTTP.get('get-buildings-from-db');
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
    })
}