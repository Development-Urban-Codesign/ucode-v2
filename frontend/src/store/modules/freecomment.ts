export interface freecommentState{
    moveComment: Boolean
}
const freecomment = {
    namespaced: true,
    state: {
        moveComment: false
        
    },
    mutations: {
        setMoveComment(state : freecommentState, toggle: boolean){
            state.moveComment = toggle
        }
       
    },
    actions: {
       
    },
    getters: {

    }
}

export default freecomment