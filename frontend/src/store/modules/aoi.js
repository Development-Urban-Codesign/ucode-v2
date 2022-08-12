import { HTTP } from '../../utils/http-common';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';

const aoi = {
    namespaced: true,
    state: {
        bbox: { xmin: 13.742725, ymin: 51.059803, xmax: 13.756758, ymax: 51.066950 },
        overpassBuildings: null,
        usedTagsForGreenery: { tags: ["leisure:garden", "leisure:park", "leisure:pitch", "landuse:village_green", "landuse:grass", "landuse:garden", "landuse:cemetery", "landuse:allotments", "landuse:forest", "natural:scrub"] },
        overpassGreenery: null,

    },
    mutations: {

    },
    actions: {

        getGreeneryFromOSM({ state }) {
            HTTP
                .post('get-greenery-from-osm', {
                    bbox: state.bbox,
                    usedTagsForGreenery: state.usedTagsForGreenery
                })
        },
        getGreeneryFromDB({ state, rootState }) {
            HTTP
                .get('get-greenery-from-db')
                .then(response => {
                    console.log(response)
                    state.overpassGreenery = new MapboxLayer({
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

                    });
                    rootState.map.map.addLayer(state.overpassGreenery);

                    // rootState.map.map.on('click', 'overpass_buildings', (e) => {
                    //     console.log(e)
                    // })
                })
        },

    },
    getters: {

    }

}

export default aoi