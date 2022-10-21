export interface freecommentState{
    moveComment: Boolean
}
const freecomment = {
    namespaced: true,
    state: {
        moveComment: false
        
    },
    mutations: {
        toggleMoveComment(state : freecommentState){
            state.moveComment = !state.moveComment
        }
       
    },
    actions: {
       
    },
    getters: {

    }
}

export default freecomment