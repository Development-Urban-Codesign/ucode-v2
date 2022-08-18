const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
const map = {
    namespaced: true,
    state: {
        layers: [],
        map: null,
        center: {
            lng: 13.749748,
            lat: 51.063371
        },
        zoom: 15,
        minZoom: 4,
        maxZoom: 23,
        maxPitch: 85,
        style: `https://api.maptiler.com/maps/pastel/style.json?key=${apiKey}`
    },
    mutations: {

    },
    actions: {
        addLayer({ state }, newLayer) {
            state.layers = [...state.layers, newLayer]
        }
    },
    getters: {

    }
}

export default map