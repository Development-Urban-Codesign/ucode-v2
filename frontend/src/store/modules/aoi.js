import { HTTP } from '../../utils/http-common';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';

const aoi = {
    namespaced: true,
    state: {
        bbox: { xmin: 13.742725, ymin: 51.059803, xmax: 13.756758, ymax: 51.066950 },
        overpassBuildings: null,
        usedTagsForGreenery: { tags: ["leisure:garden", "leisure:park", "leisure:pitch", "landuse:village_green", "landuse:grass", "landuse:garden", "landuse:cemetery", "landuse:allotments", "landuse:forest", "natural:scrub"] },
        

    },
    mutations: {

    },
    actions: {

    },
    getters: {

    }

}

export default aoi