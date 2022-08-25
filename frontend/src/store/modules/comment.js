const comment = {
    namespaced: true,
    state: {
        toggle:false,
        commentData: {},
        date: ""
    },
    mutations: {
        setCommentToggle(state){
            state.toggle=true
        },
        getClickedCommentObject(state, payload){
            let timestamp = new Date(payload.properties.created_at);
            let date = new Date(Date.parse(timestamp));
            date = date.toUTCString()
            payload.properties.created_at=date
            state.commentData = payload
        
        }
    },
    actions: {
        
    },
    getters: {

    }
}

export default comment