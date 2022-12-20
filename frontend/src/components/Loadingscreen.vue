<template>
  <div class="loading-screen-wrapper">
    <transition name="scale">
      <v-img v-if="true" max-height="60" class="UcodeLogo" src="UCODE_Logo_black.png"></v-img>
    </transition>  
    <div class="LoadingText  text-body-1 text-medium-emphasis">
      <transition-group name="fade">
        <div class="LoadingText" v-if="showLoadingText">
          <div>
            {{ curLoadingText }}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const loadingTexts = ["Bäume pflanzen...", "Grünflächen pflegen...", "Gebäude planen...", "Straßen markieren...", "Ampeln aufstellen...", "Wasserbecken füllen...", "Orte markieren...","", "...gleich geschafft...","", "...die Internetverbindung scheint langsam...", "... haben Sie noch einen Moment Geduld, falls die Seite nicht lädt, probieren sie bitte einen anderen Browser!"]
const curLoadingText = ref("Karte wird befüllt...")
let i = 0
const showLoadingText = ref(true)
async function animate() {
  const interval = setInterval(function () {
    curLoadingText.value = loadingTexts[i]

    if (showLoadingText.value == false) {
      i++
      // console.log(i)
      showLoadingText.value = true
    }
    else {
      showLoadingText.value = false
    }
    if (i >= loadingTexts.length) {
      clearInterval(interval)
      i = 0
    }
  }, 1000);


}
animate();
</script>

<style scoped>
.loading-screen-wrapper {
  background-color: #7FA8B5;
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  flex-direction: column;
  z-index: 9999;
}

.UcodeLogo {
  margin-top: 50px;
  animation: append-animate 0.5s ease-out;
}

.LoadingText {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  min-height: 50px;
}

/* Animation */
/* Logo      */
@keyframes append-animate {
	0% {
		transform: scale(0.5);
		opacity: 0;
	}
  75% {
		transform: scale(1.05);
		opacity: 0.75;
	}
	100% {
		transform: scale(1);
		opacity: 1;	
	}
}

/* Text */
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