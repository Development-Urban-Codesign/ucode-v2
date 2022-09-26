<template>
  <div class="Loadingscreen">
    <v-img max-height="60" class="UcodeLogo" src="UCODE_Logo.png"></v-img>
    <div class="LoadingText">
      <transition-group name="fade">
        <div class="LoadingText" v-if="showLoading">
          <div>
            {{curLoadingText}}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const Loadingtexts = ["Bäume pflanzen...", "Grünflächen anlegen...", "Gebäude hochziehen...", "Straßen einziehen..."]
let curLoadingText = ref("Karte wird befüllt...")
let i = 0
const showLoading = ref(true)
async function animate() {
  setInterval(function () {
    curLoadingText.value = Loadingtexts[i]
    // console.log(curLoadingText.value)
    // console.log(showLoading.value)
    
    if (showLoading.value == false) {
      i++
      // console.log(i)
      showLoading.value = true
    }
    else {
      showLoading.value = false
    }
    if (i >= Loadingtexts.length) {
      i = 0
    }
    
  }, 750);
  
}
animate();
</script>

<style scoped>
.Loadingscreen {
  z-index: 1000;
  background-color: #81ABBC;
  width: 100vw;
  height: 100vh;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.UcodeLogo {
  margin-top: 50px;
}

.LoadingText {
  text-align: center;
  font-size: large;
  min-height: 50px;
  margin-bottom: 50px;
}

.loading-enter-from {
  opacity: 0;
  /* transform: translateY(60px); */
}

.loading-enter-to {
  opacity: 1;
  /* transform: translate(0px); */
}

.loading-enter-active {
  transition: all 1s ease;
}

.loading-leave-from {
  opacity: 1;
}

.loading-leave-to {
  opacity: 0;
}

.loading.leave-active {
  transition: all 1s ease;
}

.fade-enter-active {
  transition: all .3s ease-in;
}

.fade-leave-active {
  transition: all .3s ease-in;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>