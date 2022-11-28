<template>
    <transition  name="slide">
        <div v-if="props.show" className="bg">
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
.bg{
    position: fixed;
    top: 0px;
    width: 100vw;
    height: 93.5vh;
    background: rgba(210,210,210,0.4);
    backdrop-filter: blur(5px);
    z-index: 100;
    padding: 1em 0em;
    overflow-x: hidden !important;
    overflow-y: scroll !important;
    scrollbar-width: none !important;
}

.bg::-webkit-scrollbar {
  display: none;
}

.slide-enter-active{
    transform: translateX(100%);
    transition: transform .25s ease-in-out;
}

.slide-enter-to{
  transform: translateX(0%);
}

 .slide-leave-active {
    transform: translateX(0%);
    transition: transform .25s ease-in-out;
}

.slide-leave-to{
    transform: translateX(100%);
}

.v-card{
    margin: 1em 0em;
    margin-left: 50%;
    transform: translateX(-50%);
    width: 90% !important;
    border-radius: 1em;
}
</style>