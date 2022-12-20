<template>
    <v-bottom-navigation grow mode="shift" :elevation="6" color="secondary" :model-value="tabIndex" @update:modelValue="handleValueChange">
        <v-btn value="planning" >
            <v-icon>mdi-message-draw</v-icon>
            <span>Planung</span>
        </v-btn>
        <v-btn value="discussion">
            <v-icon>mdi-comment-text-multiple</v-icon>
            <span>Diskussion</span> 
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
        position: absolute !important;
    }
    .v-btn{
        color: #747474;
    }
</style>