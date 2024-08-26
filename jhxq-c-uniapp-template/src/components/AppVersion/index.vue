<script setup lang='ts'>
import { onMounted, ref } from "vue";
const version = ref('1.0.0');
const getVersion = () => {
    let res = uni.getAccountInfoSync();
    version.value = res.miniProgram.envVersion + ' v' + (res.miniProgram.version || '1.0.0');
}

onMounted(()=>{
    getVersion()
})
</script>

<template>
    <view class="app-version">
        <text class="version">{{ version }}</text>
    </view>
</template>

<style scoped>
.app-version {
    position: fixed;
    z-index: 999;
    color: #FFF;
    font-size: 28rpx;
    bottom: 32rpx;
    left: 32rpx;
    opacity: 0.1;
    pointer-events: none;
}
</style>