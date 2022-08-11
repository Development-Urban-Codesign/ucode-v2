<template>
<v-col
    cols="10"
    sm="1"
    style= "position: absolute; right: 0; top: 60px;z-index:999"
>
    <v-select
        :items="['get', 'retrieve']"
        label="building"
        variant="outlined"
        @update:modelValue="sendBuildingRequest"
    ></v-select>
   <v-select
        :items="['get', 'retrieve']"
        label="greenery"
        variant="outlined"
        @update:modelValue="sendGreeneryRequest"
    ></v-select>
   
</v-col>


</template>

<script setup>
import {useStore} from "vuex";
const store = useStore();

const sendBuildingRequest = (e)=>{
    e == "get" ? store.dispatch("aoi/getbuildingsFromOSM") : store.dispatch("aoi/getbuildingsFromDB")
}
const sendGreeneryRequest = (e)=>{
    e == "get" ? store.dispatch("aoi/getGreeneryFromOSM") : store.dispatch("aoi/getGreeneryFromDB")
}
</script>

<style scoped>

</style>