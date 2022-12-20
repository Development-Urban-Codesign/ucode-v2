<template>
    <div class="comment-gallery-wrapper">
        <transition name="slide">
            <div v-if="(commentsAreLoaded && props.show)" className="comment-list">
                
                <v-card
                    v-for="comment in commentList"
                    elevation="3"
                >
                    <transition name="fade">
                        <div v-if="commentsAreLoaded" class="time-text text-body-2 text-disabled">{{getRelativeTime(comment.properties.created_at)}}</div>
                    </transition>
                    <div class="comment-text text-body-1">{{comment.properties.comment}}</div>
                    <div class="action-area">
                        <v-chip v-if="comment.properties.user_id !=='anonymous'" variant="elevated" color="primary" >Meine</v-chip>
                        <v-btn
                            class="btn-end"
                            variant="plain"
                            size="small"
                            :icon="comment.properties.user_id !=='anonymous'?'mdi-pencil':'mdi-heart'"
                        ></v-btn>
                        <v-btn
                            class="btn-end"
                            variant="plain"
                            size="small"
                            :icon="comment.properties.user_id !=='anonymous'?'mdi-delete':'mdi-thumb-down'"
                        ></v-btn>
                    </div>
                </v-card>
            </div>
        </transition>
        <transition  name="fade">
            <div v-if="props.show" className="backdrop">
                <div v-if="(!commentsAreLoaded && props.show)" class="comment-list">
                    <CardSkeleton v-for="index in 4" :key="index"></CardSkeleton>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { onMounted, ref, watch } from 'vue';
    import { useStore } from "vuex";
    import { getFilteredCommentsFromDB } from "../service/backend.service";
    import CardSkeleton from "@/components/CardSkeleton.vue";
import { Data } from 'apache-arrow';
import { number } from '@intlify/core-base';

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
    const delay = (time) => {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    const sendCommentRequest = async () => {
        commentsAreLoaded.value = false;
        let response = []
        let myComments = []
        let otherComments = []
        var start = await performance.now();
        // await delay(2000)

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

        // console.log("Meine Kommentare:")
        // console.log(myComments)
        // console.log("Andere Kommentare:")
        // console.log(otherComments)

        commentList.value = myComments.concat(otherComments);

        var loadingTime = performance.now() - start
        if(loadingTime - start < 300){
            await delay(300 - loadingTime)
        }
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
    height: calc(100% - 56px + 10rem);
    z-index: 1001;
    padding: 0em 0em;
    padding-bottom: 10rem;
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
.v-card{
    margin: 1.5rem 0rem;
    margin-left: 50%;
    padding: 1.5rem;
    transform: translateX(-50%);
    width: calc(100% - 3rem) !important;
    border-radius: 18px;
}
.time-text{
    margin-bottom: 0.5rem;
}
.comment-text{
    min-height: 4.5rem;
    white-space: pre-line;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
}
.action-area{
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.v-chip{
    color: white !important;
    margin: 0rem auto 0rem 0rem;
}
.btn-end{
    font-size: 1rem;
    margin-left: 1rem;
}

/* Animation */
/* Card      */
.slide-enter-active {
    animation: bounce-in;
    animation-duration: 0.5s;
    animation-delay: 0.4s;
}
@keyframes bounce-in {
  0% {
    transform: translateY(0rem);
    animation-timing-function: cubic-bezier(0.33333, 0.66667, 0.66667, 1)
  }
  76% {
    transform: translateY(-10rem);
    animation-timing-function: cubic-bezier(0.33333, 0, 0.66667, 0.33333)
  }
  100% {
    transform: translateY(0rem);
  }
}

 .slide-leave-active {
    opacity: 1;
    transition: all .2s ease-in;
}

.slide-leave-to{
    opacity: 0;
}

/* Backdrop */
.fade-enter-active{
    opacity: 0;
    transition: opacity 0.2s linear;
}

.fade-enter-to{
    opacity: 1;
}

 .fade-leave-active {
    opacity: 1;
    transition: opacity 0.3s linear;
}

.fade-leave-to{
    opacity: 0;
}


</style>