<template>
  <div class="Loadingscreen">
    <v-img max-height="60" class="UcodeLogo" src="UCODE_Logo.png"></v-img>
    <div class="LoadingText">
      <transition-group name="fade">
        <div class="LoadingText" v-if="showLoadingText">
          <div>
            {{curLoadingText}}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const loadingTexts = ["Bäume pflanzen...", "Grünflächen pflegen...", "Gebäude planen...", "Straßen markieren..."]
const curLoadingText = ref("Karte wird befüllt...")
let i = 0
const showLoadingText = ref(true)
async function animate() {
  console.log("animate")
  const interval = setInterval(function () {
    curLoadingText.value = loadingTexts[i]
    
    if (showLoadingText.value == false) {
      i++
      // console.log(i)
      showLoadingText.value = true
    }
    else {
      console.log("exec")
      showLoadingText.value = false
    }
    if (i >= loadingTexts.length) {
      clearInterval(interval)
      i = 0
    }
    
  }, 750);
  
}
animate();
</script>

<style scoped>
.Loadingscreen {
  z-index: 999;
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