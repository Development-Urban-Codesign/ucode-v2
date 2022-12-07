<template>
    <div class="comment-gallery-wrapper">
        <transition name="slide">
            <div v-if="(commentsAreLoaded && props.show)" className="comment-list">
                
                <v-card
                    v-for="comment in commentList"
                    :subtitle="getRelativeTime(comment.properties.created_at)"
                >
                <p class="comment-text text-body-1">{{comment.properties.comment}}</p>
                <v-chip v-if="comment.properties.user_id !=='anonymous'" size="small">Meine</v-chip>
                </v-card>
            </div>
        </transition>
        <transition  name="fade">
            <div v-if="props.show" className="backdrop"></div>
        </transition>
    </div>
</template>

<script setup>
    import { onMounted, ref, watch } from 'vue';
    import { useStore } from "vuex";
    import { getFilteredCommentsFromDB } from "../service/backend.service";

    const store = useStore(); 
    const projectId = store.state.aoi.projectSpecification.project_id;
    const userId = store.state.aoi.userId;

    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        }
    })

    if(props.show){
        sendCommentRequest()
    }

    let commentList = ref([])
    let commentsAreLoaded = ref(false)

    const getRelativeTime = (timestamp) => {
        let today = new Date();

        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = today - new Date(timestamp);

        if (elapsed < msPerMinute) {
            let ending = Math.round(elapsed/1000) === 1?' Sekunde':' Sekunden'
            return 'vor ' + Math.round(elapsed/1000) + ending;  
        }

        else if (elapsed < msPerHour) {
            let ending = Math.round(elapsed/msPerMinute) === 1?' Minute':' Minuten'
            return 'vor ' + Math.round(elapsed/msPerMinute) +ending; 
        }

        else if (elapsed < msPerDay ) {
            let ending = Math.round(elapsed/msPerHour) === 1?' Stunde':' Stunden'
            return 'vor ' + Math.round(elapsed/msPerHour) +ending; 
        }

        else if (elapsed < msPerMonth) {
            let ending = Math.round(elapsed/msPerDay) === 1?' Tag':' Tagen'
            return 'vor ' + Math.round(elapsed/msPerDay) +ending;  
        }

        else if (elapsed < msPerYear) {
            let ending = Math.round(elapsed/msPerMonth) === 1?' Monat':' Monate'
            return 'vor ' + Math.round(elapsed/msPerMonth) +ending;     
        }

        else {
            let ending = Math.round(elapsed/msPerYear) === 1?' Jahr':' Jahren'
            return 'vor ' + Math.round(elapsed/msPerYear) +ending;    
        }
    }

    const sendCommentRequest = async () => {
        commentsAreLoaded.value = false;
        let response = []
        let myComments = []
        let otherComments = []

        const commentData = await getFilteredCommentsFromDB(projectId, userId)
    //    console.log(commentData.props.data)
        response = commentData.props.data
        response.forEach(item => {
            item.properties.user_id !== userId?otherComments.push(item):myComments.push(item);
        })

        myComments = myComments.sort((a,b)=> new Date(b.properties.created_at).getTime() - new Date(a.properties.created_at).getTime())
        otherComments = otherComments.sort((a,b)=> new Date(b.properties.created_at).getTime() - new Date(a.properties.created_at).getTime())

//        myComments = myComments.sort((a, b) => { return new Date(a) - new Date(b); }).reverse()
//        otherComments = otherComments.sort((a, b) => { return new Date(a) - new Date(b); }).reverse()

        console.log("Meine Kommentare:")
        console.log(myComments)
        console.log("Andere Kommentare:")
        console.log(otherComments)

        commentList.value = myComments.concat(otherComments);
        commentsAreLoaded.value = true;
    }

    onMounted(() => {
        sendCommentRequest();
    })

    watch(props, function () {
        if (props.show){
            sendCommentRequest();
        }
    })
</script>

<style scoped>
.comment-gallery-wrapper{
    width: 100%;
}
.comment-list{
    position: fixed;
    top: 0px;
    width: 100vw;
    height: calc(100% - 56px);
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
    height: 100%;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    -moz-backdrop-filter: blur(24px);
    -ms-backdrop-filter: blur(24px);
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

.v-chip{
    margin: 1em 0em 1em 1em;
}

.comment-text{
    margin: 0em 1em 1em 1em;
    white-space: pre-line;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
}
</style>