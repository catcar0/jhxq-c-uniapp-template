<script setup lang='ts'>
import { IsDev } from "@/utils/utils";
defineProps<{
    roleId?: number | string
}>()

const emit = defineEmits(["update:roleId"]);

const handleInput = (e:any) => {
    let value = e.detail.value;
    emit('update:roleId',value)
}
</script>

<template>
    <view class="dev-role-select" v-if="IsDev()">
        <text>角色ID - 开发调试使用</text>
        <input @input="handleInput" type="number" placeholder="请输入进入房间的角色ID">
    </view>
</template>

<style scoped>
.dev-role-select{
    padding: 20rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    padding-top: 60rpx;
    background-color: #FFF;
    border-radius: 10px;
}

.dev-role-select>text{
    display: block;
    font-size: 24rpx;
}

.dev-role-select>input{
    width: 100%;
    background-color: #eee;
    border-radius: 5px;
    height: 80rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    text-align: center;
}
</style>