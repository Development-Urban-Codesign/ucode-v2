import { HTTP } from '../../utils/http-common';

const comment = {
    namespaced: true,
    state: {
        toggle:false,
        commentData: {},
        likedCommentIds: [],
        unlikedCommentIds: [],
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
        likeComment({state}, payload){
            if (state.likedCommentIds.includes(payload)){
                state.commentData.properties.likes--
                const index = state.likedCommentIds.indexOf(payload);
                if (index > -1) {
                    state.likedCommentIds.splice(index, 1);
                }
                HTTP
                .post('unlike-comment', {
                    id: payload,
                })
                
            }
            else{
                state.commentData.properties.likes++
                state.likedCommentIds.push(payload)
                HTTP
                .post('like-comment', {
                    id: payload,
                })
            }

        },
        dislikeComment({state}, payload){
            if (state.unlikedCommentIds.includes(payload)){
                state.commentData.properties.dislikes--
                const index = state.unlikedCommentIds.indexOf(payload);
                if (index > -1) {
                    state.unlikedCommentIds.splice(index, 1);
                }
                HTTP
                .post('undislike-comment', {
                    id: payload,
                })
                
            }
            else{
                state.commentData.properties.dislikes++
                state.unlikedCommentIds.push(payload)
                HTTP
                .post('dislike-comment', {
                    id: payload,
                })
            }
        }
    },
    getters: {
       
    }
}

export default comment