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
   
   
</v-col>


</template>

<script setup>
import {useStore} from "vuex";
const store = useStore();

const sendBuildingRequest = (e)=>{
    e == "get" ? store.dispatch("aoi/getbuildingsFromOSM") : store.dispatch("aoi/getbuildingsFromDB")
}
</script>

<style scoped>

</style>