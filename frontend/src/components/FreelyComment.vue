<template>
    <div class="comment-container">
        <v-row no-gutters justify="center">
            <v-btn v-show="commentStep == 0" class="mb-10;" size="large" rounded="pill" color="primary"
                @mousedown="emit('getCenterOnMap')" @click="createComment">Kommentieren
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
                            <v-textarea rows="2" no-resize label="Kommentar" variant="underlined" color="indigo"
                                :modelValue="commentText" @update:modelValue="text => commentText = text">
                            </v-textarea>
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
import { useStore } from 'vuex';
import { HTTP } from '@/utils/http-common';
import { ref } from 'vue';
const store = useStore()
let flexOrder = ref<number>(-1)
let paddingBot = ref<string>("20px")
let commentStep = ref<number>(0)
let commentText = ref<string>("")

const props = defineProps({
    clickedCoordinates: Array<Number>,
})

const emit = defineEmits(["addComment", "getCenterOnMap"])

function createComment() {
    let marker = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: props.clickedCoordinates
        }
    }
    let mapsource = {
        id: "ownComments",
        geojson: {
            "type": "geojson",
            "data": marker
        }
    }
    let ownCommentLayer = {
        'id': "ownComments",
        'type': 'symbol',
        'source': "ownComments",
        'layout': {
            'icon-image': 'comment.png', // reference the image
            'icon-size': 0.25,
            'icon-offset': [130, 25],
            'icon-anchor': "bottom",
            'icon-allow-overlap': true,
            // 'icon-ignore-placement': true
        },
        'paint': {
            // 'fadeDuration': 0
        }
    }
    emit('addComment', mapsource, ownCommentLayer)
    commentStep.value++
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

    const submitComment = () => {
        HTTP
            .post('add-comment', {
                projectId: store.state.aoi.projectSpecification.project_id,
                comment: commentText.value,
                position: props.clickedCoordinates
            })
    }
    console.log(store.state.aoi.projectSpecification.project_id);
    console.log(commentText.value);
    console.log(props.clickedCoordinates);

    submitComment()
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
    /* margin-top: 2px; */
    padding-bottom: v-bind('paddingBot');
    width: 100%;
    order: v-bind('flexOrder');
}
</style>