export interface PulseState{
    pulseCoordinates: object;
    pulseAnimationActivation: unknown;

}

const pulse = {
    namespaced: true,
    state: {
        pulseCoordinates: {},
        pulseAnimationActivation: null
    },
    mutations: {
        pulsedata(state:PulseState, payload:PulseState){
            state.pulseCoordinates=payload
        }
    },
    actions: {
       
    },
    getters: {

    }
}

export default pulse