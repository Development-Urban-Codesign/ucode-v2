import { HTTP } from '../../utils/http-common';
import {GeoJsonLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';

const aoi = {
    namespaced: true,
    state: {
        bbox : {xmin: 13.742725, ymin: 51.059803, xmax: 13.756758, ymax: 51.066950},
        overpassBuildings: null,

    },
    mutations:{

    },
    actions:{
        getbuildingsFromOSM({state}){
            HTTP
            .post('get-buildings-from-osm', {
                bbox : state.bbox
            })
        },
        getbuildingsFromDB({state, rootState}){
            HTTP
            .get('get-buildings-from-db')
            .then(response=>{
                console.log(response)
                state.overpassBuildings = new MapboxLayer({
                    id: 'overpass_buildings',
                    type: GeoJsonLayer,
                    data: response.data.features,
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
                    
                });
                rootState.map.map.addLayer(state.overpassBuildings);
                rootState.map.map.on('click', 'overpass_buildings', (e) => {
                    console.log(e)
                })
            })
        },

    },
    getters:{

    }

}

export default aoi