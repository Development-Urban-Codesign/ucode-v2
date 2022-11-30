<template>
    <div class="comment-galary-wrapper">
        <transition name="slide">
            <div v-if="props.show" className="comment-list">
                <v-card
                    title="Platzhalter"
                    subtitle="This is a subtitle"
                    text="This is content"
                ></v-card>
                <v-card
                    title="Platzhalter"
                    subtitle="This is a subtitle"
                    text="This is content"
                ></v-card>
            </div>
        </transition>
        <transition  name="fade">
            <div v-if="props.show" className="backdrop"></div>
        </transition>
    </div>
</template>

<script setup>
    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        }
    })
</script>

<style scoped>
.comment-galary-wrapper{
    width: 100%;
}
.comment-list{
    position: fixed;
    top: 0px;
    width: 100vw;
    height: 93.5vh;
    z-index: 1001;
    padding: 1em 0em;
    overflow-x: hidden !important;
    overflow-y: scroll !important;
    scrollbar-width: none !important; 
}

.backdrop{
    position: fixed;
    top: 0px;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(24px);
    z-index: 1000;
}

.comment-list::-webkit-scrollbar {
  display: none;
}

.slide-enter-active{
    transform: translateX(100%);
    transition: transform .3s ease-in-out;
}

.slide-enter-to{
  transform: translateX(0%);
}

 .slide-leave-active {
    transform: translateX(0%);
    transition: transform .3s ease-in-out;
}

.slide-leave-to{
    transform: translateX(100%);
}

.fade-enter-active{
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
}

.fade-enter-to{
    opacity: 1;
}

 .fade-leave-active {
    opacity: 1;
    transition: opacity 0.1s ease-in-out;
}

.fade-leave-to{
    opacity: 0;
}

.v-card{
    margin: 1em 0em;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 90% !important;
    border-radius: 1em;
}
</style>