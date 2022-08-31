const pulse = {
    namespaced: true,
    state: {
        pulseCoordinates: {},
        pulseAnimationActivation: null
    },
    mutations: {
        pulsedata(state, payload){
            state.pulseCoordinates=payload
        }
    },
    actions: {
       
    },
    getters: {

    }
}

export default pulse