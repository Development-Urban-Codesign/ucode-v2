<template>
    <div class="comment-container">
        <v-row no-gutters justify="center">
            <v-btn v-if="commentStep == 0" class="mb-10;" size="large" rounded="pill" color="primary"
                @click="createComment">Kommentieren
            </v-btn>
            <v-col v-if="commentStep == 1" cols-sx="12" sm="10" md="6" lg="4">
                <v-card style="text-align: center;"
                    text="Wähle eine Route und positioniere den Kommentar per Drag'n'Drop">
                    <v-row justify="center" style="min-height: 10px; margin:0px">
                        <v-icon>
                            mdi-circle-medium
                        </v-icon>
                        <v-icon color="grey">
                            mdi-circle-medium
                        </v-icon>
                    </v-row>
                    <v-card-actions style="justify-content: center;">
                        <v-btn @click="positionOkay" style="left:0; top:0; transform: 0;" rounded="lg" location="center"
                            color="secondary">Weiter</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col v-if="commentStep == 2" cols-sx="12" sm="10" md="6" lg="4">
                <v-card style="text-align: center;" text="Schreibe deinen Kommentar">
                    <v-row justify="center" style="min-height: 10px; margin:0px">
                        <v-icon color="grey">
                            mdi-circle-medium
                        </v-icon>
                        <v-icon>
                            mdi-circle-medium
                        </v-icon>
                    </v-row>
                    <v-row no-gutters justify="center" style="margin:0px; margin-left:10px; align-items: flex-end;">
                        <v-col cols="10">
                            <v-textarea style="margin-top:10px;" rows="2" no-resize label="Kommentar"
                                variant="outlined"></v-textarea>
                        </v-col>
                        <v-col cols="2">
                            <v-btn @click="saveComment" icon="mdi-send-outline" variant="plain"
                                style=" justify-content: start; size: x-large; padding-bottom: 15px;">

                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

let flexOrder = ref<number>(-1)
let paddingBot = ref<string>("20px")
let commentStep = ref<number>(0)
const emit = defineEmits(["addComment"])
const createComment = () => {

    emit('addComment', "asd")
    commentStep.value++
    console.log(commentStep)
    flexOrder.value = 1
    paddingBot.value = "0px"
}
const positionOkay = () => {
    commentStep.value++
}
const saveComment = () => {
    commentStep.value = 0
    flexOrder.value = -1
    paddingBot.value = "20px"
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
    margin-top: 2px;
    padding-bottom: v-bind('paddingBot');
    width: 100%;
    order: v-bind('flexOrder');
}
</style>