import { HTTP } from '../../utils/http-common';
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';

const aoi = {
    namespaced: true,
    state: {
        //bbox: { xmin: 13.723167, ymin:51.053100, xmax: 13.770031, ymax: 51.079799 }, // DResden
        projectSpecification: null, // Mainz
        projectId: '0',
        //bbox: { xmin: -74.023387, ymin: 40.741825, xmax: -73.877212, ymax: 40.825175}, // Manhatten
        overpassBuildings: null,
        usedTagsForGreenery : {tags: ["natural:wood","landuse:meadow", "landuse:recreation_ground", "leisure:garden", "leisure:park", "leisure:pitch" , "landuse:village_green", "landuse:grass", "landuse:garden", "landuse:cemetery", "landuse:allotments", "landuse:forest", "natural:scrub"] },
        overpassGreenery: null,
        dataIsLoaded: false,
        dataIsLoading: false,
        mapIsPopulated: false,
        isDevmode: false

    },
    mutations: {
        setProjectSpecification(state, payload){
            state.projectSpecification = payload
        },
        setProjectId(state, projectId){
            state.projectId = projectId
        },
        setDevmode(state,bool){
            state.isDevmode = bool
        }
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
        setMapIsPopulated({state}){
            state.mapIsPopulated = true;
        },
    },
    getters: {

    }

}

export default aoi