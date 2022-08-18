<template>
    <v-col
        cols="1"
        sm="1"
        style="position:absolute; left: 0; top:0; z-index:999"
    >
        <v-btn
            rounded="pill"
            color="secondary"
            @click="setCommentToggle(); createComment()"
        >
        Comment
    </v-btn>
    <v-btn
            rounded="pill"
            color="primary"
            @click="setLineDrawToggle(); drawLine()"
            class="mt-2"
        >
        Draw Line
        </v-btn>
    </v-col>
       
</template>

<script setup>

import {useStore} from "vuex";
const store = useStore();


const setCommentToggle = ()=>{
    store.commit("contribution/setCommentToggle")
}

const createComment = ()=>{
    if (store.state.contribution.commentToggle == true){
        store.dispatch("contribution/createComment")
    }
}
const setLineDrawToggle = ()=>{
    store.commit("contribution/setLineDrawToggle")
}
const drawLine = ()=>{
    store.dispatch("contribution/drawLine")
}





</script>

<style scoped>

</style>