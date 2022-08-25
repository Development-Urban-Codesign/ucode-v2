<template>
<div>
<transition name="bounce">
       
    <v-card
        v-show="store.state.comment.toggle"
        class="comment-content"
        width="400"
    >
        <v-row no-gutters>
            <v-col md="10">
                <v-card-title >
                    {{store.state.comment?.commentData?.properties?.comment}}
                </v-card-title>
            </v-col>

            <v-col
                md="2"
            >
    
                <v-btn
                    icon="mdi-close-circle-outline"
                    @click.stop="store.state.comment.toggle=false"
                    class="ma-2"
                    variant="text"
                    color="blue-lighten-2"
                >
        
                </v-btn>
            </v-col>
        </v-row>
       <v-card-subtitle>
        created at: {{store.state.comment?.commentData?.properties?.created_at}}

        </v-card-subtitle>
        <v-card-subtitle>
        {{store.state.comment?.commentData?.properties?.likes}} likes
        {{store.state.comment?.commentData?.properties?.dislikes}} dislikes

        </v-card-subtitle>

        <v-card-text>
            {{store.state.comment?.commentData?.properties?.comment}}
        </v-card-text>
        
        <v-divider class="mx-4"></v-divider>
    
        
    </v-card>
    
</transition >

</div>
        
    

</template>

<script setup>
import { useStore } from "vuex";
const store = useStore();

</script>

<style scoped>
.comment-content{
    position: absolute;
    right:0;
    top:0;
    height: 100vh;
    z-index:999;
}
.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}



</style>