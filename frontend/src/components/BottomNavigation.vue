<template>
    <v-bottom-navigation grow :elevation="6" color="primary" :model-value="tabIndex" @update:modelValue="handleValueChange">
        <v-btn value="planning" >
            <v-icon>mdi-message-draw</v-icon>
            Planung
        </v-btn>
        <v-btn value="discussion">
            <v-icon>mdi-comment-text-multiple</v-icon>
            Diskussion 
        </v-btn>
    </v-bottom-navigation>
    
</template>

<script setup>
    const props = defineProps({
        tabIndex: {
            type: String,
            default: "planning"
        }
    })

    const emit = defineEmits(['tabIndexChanged'])

    const handleValueChange = newValue => {
        if (newValue !== undefined){
            emit('tabIndexChanged', newValue)
        }
    }
</script>

<style scoped>
    .v-bottom-navigation{
        position: relative !important;
    }
</style>