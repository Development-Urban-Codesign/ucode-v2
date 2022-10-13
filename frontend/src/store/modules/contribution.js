
import CommentPopupContent from '@/components/CommentPopupContent.vue';
import LinePopupContent from '@/components/LinePopupContent.vue';
import { PathLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import maplibregl from 'maplibre-gl';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import store from '../store';


const conntribution = {
    namespaced: true,
    state: {
        commentToggle: false,
        commentText: '',
        commentPosition: [],
        commentPopup: null,
        commentGeojson: {
            "type": "FeatureCollection",
            "features": []
        },
        draw: null,
        drawnLineGeometry: null,
        linePopup: null,
        lineDrawToggle: false,
        drawnPathlayer: {},
        drawnPathlayerId: null

    },
    mutations: {
        setCommentToggle(state) {
            state.commentToggle = !state.commentToggle
        },
        setLineDrawToggle(state) {
            state.lineDrawToggle = true
        }
    },
    actions: {
        createComment({ state, rootState }) {

            rootState.map.map.getCanvas().style.cursor = 'crosshair'
            rootState.map.map.once('click', (e) => {
                rootState.map.map.getCanvas().style.cursor = ''
                if (state.commentToggle === true) {
                    state.commentPosition = [e.lngLat.lng, e.lngLat.lat]
                    state.commentPopup = new maplibregl.Popup()
                        .setLngLat([e.lngLat.lng, e.lngLat.lat])
                        .setHTML('<div id="vue-popup-content"></div>')
                        .addTo(rootState.map.map)

                    const app = createApp(CommentPopupContent)
                    const vuetify = createVuetify()
                    app.use(vuetify)
                    app.use(store)
                    app.mount('#vue-popup-content')
                    state.commentToggle = false

                }
            })
        },
        drawLine({ state, rootState, dispatch }) {
            if (state.draw == null) {
                state.draw = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: {
                        line_string: true,
                        trash: true,
                    },
                    defaultMode: 'draw_line_string'
                });

                rootState.map.map.addControl(state.draw, 'bottom-right');
                rootState.map.map.once('draw.create', () => {

                    state.drawnPathlayer = null
                    state.drawnLineGeometry = state.draw.getAll()

                    state.drawnPathlayerId = 'id' + (new Date()).getTime();

                    state.drawnPathlayer = new MapboxLayer({
                        id: state.drawnPathlayerId,
                        type: PathLayer,
                        data: state.drawnLineGeometry.features,
                        pickable: true,
                        widthScale: 1,
                        widthMinPixels: 2,
                        getPath: d => d.geometry.coordinates,
                        getColor: [150, 150, 150, 255],
                        getWidth: 1
                    });
                    const maplayer = rootState.map.map.getLayer(state.drawnPathlayerId);
                    if (typeof maplayer !== 'undefined') {
                        rootState.map.map.removeLayer(state.drawnPathlayerId)
                    }
                    rootState.map.map.addLayer(state.drawnPathlayer)

                    dispatch('addLinePopup')
                })
                rootState.map.map.on('draw.delete', () => {
                    setTimeout(() => {
                        if (state.draw !== null) {
                            state.draw.deleteAll()
                        }

                        if (state.linePopup?.isOpen()) {
                            state.linePopup?.remove()
                        }
                        const maplayer = rootState.map.map.getLayer(state.drawnPathlayerId);
                        if (typeof maplayer !== 'undefined') {
                            rootState.map.map.removeLayer(state.drawnPathlayerId)
                        }
                    }, 0)

                })
            }
        },
        addLinePopup({ state, rootState, dispatch }) {
            state.linePopup = new maplibregl.Popup({ closeOnClick: false, closeButton: false, })

            rootState.map.map.on('click', () => {

                if (state.lineDrawToggle == true) {
                    if (state.drawnLineGeometry?.features.length > 0) {
                        state.linePopup.setLngLat([state.drawnLineGeometry?.features[0]?.geometry?.coordinates?.slice(-1)[0][0], state.drawnLineGeometry?.features[0]?.geometry?.coordinates?.slice(-1)[0][1]])
                        state.linePopup.setHTML('<div id="draw-line-popup-contentt"></div>')

                        state.linePopup.addTo(rootState.map.map);

                        document.getElementsByClassName('mapboxgl-popup-content maplibregl-popup-content')[0].style.width = "400px"

                        const app = createApp(LinePopupContent)
                        const vuetify = createVuetify()
                        app.use(vuetify)
                        app.use(store)
                        app.mount('#draw-line-popup-contentt')
                        state.lineDrawToggle = false
                    }

                }

            });
            state.linePopup.on('close', function () {
                rootState.map.map.fire(dispatch("removeDrawnLine"))
            });

        },

        removeDrawnLine({ state, rootState }) {
            rootState.map.map.removeControl(state.draw)
            state.drawnLineGeometry = null
            state.draw = null
            state.lineDrawToggle = false
        },
        discardDrawnLine({ state, rootState, dispatch }) {

            if (state.linePopup?.isOpen()) {
                state.linePopup?.remove()
            }
            state.drawnLineGeometry = null
            state.draw = null
            state.lineDrawToggle = false
            const maplayer = rootState.map.map.getLayer(state.drawnPathlayerId);
            if (typeof maplayer !== 'undefined') {
                rootState.map.map.removeLayer(state.drawnPathlayerId)
            }
        }

    },
    getters: {

    }

}

export default conntribution