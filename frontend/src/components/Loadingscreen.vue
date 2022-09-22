<template>
  <div class="Loadingscreen">
    <v-img class="UcodeLogo" src="UCODE_Logo.png"></v-img>
    <div class="LoadingText">

      <transition name="loading">
        <div class="LoadingText">

          {{curLoadingText}}

        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const Loadingtexts = ["Constructing Buildings...", "Planting Trees..."]
let curLoadingText = ref("")

async function iterateLoadingtexts(){
  for (let index = 0; index < Loadingtexts.length; index++) {
    curLoadingText = Loadingtexts[index];
    
  }
}
iterateLoadingtexts()

</script>

<style scoped>
.Loadingscreen {
  z-index: 1000;
  background-color: #81ABBC;
  width: 100vw;
  height: 100vh;
  position: absolute;
}

.UcodeLogo {
  height: 20%;
  margin: auto;
}

.LoadingText {
  margin: auto;
  text-align: center;
  font-size: large;
}

.loading-enter-from {
  opacity: 0;
  transform: translateY(60px);
}

.loading-enter-to {
  opacity: 1;
  transform: translate(0px);
}

.loading-enter-active {
  transition: all 3s;
}
</style>