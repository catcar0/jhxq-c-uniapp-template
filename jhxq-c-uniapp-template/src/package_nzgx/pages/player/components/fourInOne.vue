<script setup lang='ts'>
import { allClues } from '@/package_nzgx/services/clues';


</script>

<template>
<view class="container">
  <view class="card card1">
    <img mode='aspectFit'
    :src="allClues['clue1'].url + '.png'" alt="">
  </view>
  <view class="card card2">
    <img mode='aspectFit'
    :src="allClues['clue2'].url + '.png'" alt="">
  </view>
  <view class="card card3">
    <img mode='aspectFit'
    :src="allClues['clue3'].url + '.png'" alt="">
  </view>
  <view class="card card4">
    <img mode='aspectFit'
    :src="allClues['clue4'].url + '.png'" alt="">
  </view>
  <view style="transform: rotateY(180deg);width: 100%;height: 100%;">
    <view class="merged-card">
      <img mode='aspectFit'
      :src="allClues['clue5'].url + '.png'" alt="">
    </view>
  </view>
</view>

</template>

<style scoped>
/* 容器样式 */
.container {
  width: 100%;
    height: 100vh;
    position: fixed;
    z-index: 99999;
    background-color: rgba(0, 0, 0, 0.6);
}

/* 每张卡片的初始样式 */
.card {
  position: absolute;
  width: 350rpx;
  height: 500rpx;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
}
.card1{
  left: 50%;
  bottom: 50%;
  transform: translate(-100%, 0%);
  animation: merge1 2s forwards;
}
.card2{
  left: 50%;
  bottom: 50%;
  transform: translate(0%, 0%);
  animation: merge2 2s forwards;
}
.card3{
  left: 50%;
  bottom: 50%;
  transform: translate(-100%, 100%);
  animation: merge3 2s forwards;
}
.card4{
  left: 50%;
  bottom: 50%;
  transform: translate(0%, 100%);
  animation: merge4 2s forwards;
}
/* 合成卡片隐藏初始状态 */
.merged-card {
  position: absolute;
  z-index: 11;
  width: 350rpx;
  height: 500rpx;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  left: 50%;
  bottom: 50%;
  transform: translate(-50%, 50%) ;
  animation: appear 3s forwards;
}

/* 动画定义，卡片向中心移动并合成 */
@keyframes merge1 {
  0% {
    opacity: 1;
    bottom: 0;
    transform: translate(-100%, 0%); /* 初始状态无变化 */
  }
  30%{
    opacity: 1;
    bottom: 50%;
    transform: translate(-100%, 0%) scale(1); /* 初始状态无变化 */
  }
  99%{
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 50%) scale(0.8);
    opacity: 0;
  }
}
@keyframes merge2 {
  0% {
    opacity: 1;
    bottom: 0;
    transform: translate(0%, 0%); /* 初始状态无变化 */
  }
  40%{
    opacity: 1;
    bottom: 50%;
    transform: translate(0%, 0%) scale(1); /* 初始状态无变化 */
  }
  99%{
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 50%) scale(0.8);
    opacity: 0;
  }
}
@keyframes merge3 {
  0% {
    opacity: 1;
    bottom: 0;
    transform: translate(-100%, 100%); /* 初始状态无变化 */
  }
  50%{
    opacity: 1;
    bottom: 50%;
    transform: translate(-100%, 100%) scale(1); /* 初始状态无变化 */
  }
  99%{
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 50%) scale(0.8);
    opacity: 0;
  }
}
@keyframes merge4 {
  0% {
    opacity: 1;
    bottom: 0;
    transform: translate(0%, 100%) ; /* 初始状态无变化 */
  }
  60%{
    opacity: 1;
    bottom: 50%;
    transform: translate(0%, 100%) scale(1); /* 初始状态无变化 */
  }
  99%{
    opacity: 1;
  }
  100% {

    transform: translate(-50%, 50%) scale(0.8);
    opacity: 0;
  }
}
/* 合成卡片出现动画 */
@keyframes appear {
  0% {
    opacity: 0;
  }
  66% {
    opacity: 0;
  }
  67% {
    transform: translate(-50%, 50%) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, 50%) rotateY(180deg);
    opacity: 1;
  }
}

</style>