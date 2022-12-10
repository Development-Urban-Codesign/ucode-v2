<template>
    <v-card
        elevation="3"
    >
        <div class="skeleton-time-text"> </div>
        <div class="skeleton-comment-text">
            <div class="skeleton-comment-line skeleton-line-1"></div>
            <div class="skeleton-comment-line skeleton-line-2"></div>
            <div class="skeleton-comment-line skeleton-line-3"></div>
        </div>
        <div class="skeleton-action-area">
            <v-chip class="skeleton-chip" color="primary" ></v-chip>
            <div class="skeleton-btn"></div>
            <div class="skeleton-btn"></div>
        </div>
    </v-card>
</template>

<style scoped>
.skeleton-time-text{
    height: 14px;
    width: 110px;
    margin-top: 3px;
    margin-bottom: 11px;
    border-radius: 1rem;
    background: rgb(0,0,0,0.1);
    animation: blink 0.6s ease-in-out 0.3s infinite alternate;
}
.skeleton-comment-text{
    display: flex;
    flex-direction: column;
}

.skeleton-comment-line{
    width: 200px;
    height: 16px;
    margin: 0.25rem 0rem;
    background: rgb(0,0,0,0.2);
    border-radius: 1rem;
    animation: blink 0.6s ease-in-out 0.3s infinite alternate;
}
.skeleton-line-1{
    width: 100%;
}
.skeleton-line-2{
    width: 50%;
}
.skeleton-line-3{
    width: 60%;
}
.skeleton-action-area{
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.skeleton-chip{
    width: 62px;
    margin: 0em auto 0em 0em;
    animation: blink 0.6s ease-in-out 0.3s infinite alternate;
}
.skeleton-btn{
    width: 40px;
    height: 40px;
    margin-left: 1rem;
    background: rgb(0,0,0,0.1);
    border-radius: 20px;
    animation: blink 0.6s ease-in-out 0.3s infinite alternate;
}

@keyframes blink {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}
</style>