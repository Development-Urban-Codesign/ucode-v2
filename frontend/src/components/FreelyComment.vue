<template>
    <v-container class="Container fill-height">
        <v-row class="ContainerRow">
            <v-btn height:50px class="CommentButton">Kommentieren</v-btn>
        </v-row>
    </v-container>
</template>
<script setup>


</script>

<style>
#Container {
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    flex-direction: column-reverse;
    
}
#ContainerRow{
    height:200px;

    justify-content: space-around;

}

#CommentButton {
    justify-content: space-around;
}
</style>