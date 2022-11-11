const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
const map = {
    namespaced: true,
    state: {
        layers: [],
        sources: [],
        map: null,
        center: { lng: 8.26952, lat: 50.0053}, // Mainz
        //center: { lng: -73.9503, lat: 40.7835}, // Manhattan
        zoom: 15,
        minZoom: 4,
        maxZoom: 23,
        maxPitch: 85,
        style: {version: 8,sources: {},layers: []}
        // style: {
        //     'version': 8,
        //     'name': 'Blank',
        //     'center': [0, 0],
        //     'zoom': 0,
        //     'sources': {
        //     'raster-tiles': {
        //     'type': 'raster',
        //     'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        //     'tileSize': 256,
        //     'minzoom': 0,
        //     'maxzoom': 19
        //     }
        //     },
        //     'layers': [
        //     {
        //     'id': 'background',
        //     'type': 'background',
        //     'paint': {
        //     'background-color': '#e0dfdf'
        //     }
        //     },
        //     {
        //     'id': 'simple-tiles',
        //     'type': 'raster',
        //     'source': 'raster-tiles'
        //     }
        //     ],
        //     'id': 'blank'
        // }
    },
    mutations: {
        addLayer(state, newLayer) {
            state.layers = [...state.layers, newLayer]
        },
        addSource(state, newSource) {
            state.sources = [...state.sources, newSource]
        }
    },
    actions: {

    },
    getters: {

    }
}

export default map