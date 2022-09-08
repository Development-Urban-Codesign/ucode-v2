import { HTTP } from '../../utils/http-common';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';

const aoi = {
    namespaced: true,
    state: {
        //bbox: { xmin: 13.723167, ymin:51.053100, xmax: 13.770031, ymax: 51.079799 },
        bbox: {xmin: 8.24287, ymin: 49.992401, xmax: 8.29617, ymax: 50.018199},
        overpassBuildings: null,
        usedTagsForGreenery : {tags: ["natural:wood","landuse:meadow", "landuse:recreation_ground", "leisure:garden", "leisure:park", "leisure:pitch" , "landuse:village_green", "landuse:grass", "landuse:garden", "landuse:cemetery", "landuse:allotments", "landuse:forest", "natural:scrub"] },
        overpassGreenery: null,
        dataIsLoaded: false,
        dataIsLoading: false,

    },
    mutations: {

    },
    actions:{
        setDataIsLoaded({state}){
            state.dataIsLoading = false;
            state.dataIsLoaded = true;
            setTimeout(() => state.dataIsLoaded = false, 3000)
        },
        setDataIsLoading({state}){
            state.dataIsLoading = true;
        },
    },
    getters: {

    }

}

export default aoi