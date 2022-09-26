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
        style: `https://api.maptiler.com/maps/pastel/style.json?key=${apiKey}`
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