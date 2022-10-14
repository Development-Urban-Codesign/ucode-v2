<template>
    <div class="comment-container">

        <v-btn @click="createComment">Kommentieren</v-btn>

    </div>
</template>
<script lang="ts" setup>

const emit = defineEmits(["addComment"])
const createComment = ()=>{

emit('addComment', "asd")
}
</script>

<style scoped>
.comment-container {
    position: relative;
    z-index: 999;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
}
</style>