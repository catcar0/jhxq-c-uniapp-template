<script setup lang="ts">
import { useMainAuthStore } from '@/stores/auth';
import { WxLocalInfos } from '@/utils/auth';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    show: boolean
}>()
const emit = defineEmits(["update:show", "success"]);

const MainAuthStore = useMainAuthStore();
const avatar = ref<string>('');
const nickname = ref<string>('');
const IsNeedBindTel = computed(() => MainAuthStore.IsNeedBindTel);

watch(() => props.show, (value) => {
    if (value) {
        avatar.value = WxLocalInfos.get('avatar') || '';
        nickname.value = WxLocalInfos.get('nickname') || '';
    }
})

const onChooseAvatar = (e: any) => {
    avatar.value = e.detail.avatarUrl;
}

const getphonenumber = (e: any) => {
    if (e.detail.iv) {
        let { iv, encryptedData } = e.detail;
        login(iv, encryptedData);
    } else {
        uni.showToast({
            icon: 'none',
            title: "请先绑定手机号!"
        })
        return;
    }
}

const login = async (iv?: string, encryptedData?: string) => {
    if (!avatar.value || !nickname.value.trim()) {
        uni.showToast({
            icon: 'none',
            title: "请填写正确的头像或昵称!"
        })
        return;
    };

    try {
        WxLocalInfos.set('avatar', avatar.value);
        WxLocalInfos.set('nickname', nickname.value);
        let base64Avatar = await file2Base64(avatar.value);
        await MainAuthStore.Auth({
            avatar: base64Avatar,
            nickname: nickname.value,
            iv,
            encryptedData
        })
        emit('update:show', false);
        emit('success', {
            avatar,
            nickname
        })
    } catch (err: any) { }
}

const file2Base64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        uni.getFileSystemManager().readFile({
            filePath: avatar.value,
            encoding: "base64",
            success: res => {
                let base64 = 'data:image/png;base64,' + res.data;
                resolve(base64);
            }, fail: err => reject(err.errMsg)
        })
    })
}
</script>

<template>
    <view v-if="show" class="popup-mask">
        <view class="login-popup">
            <view class="body">
                <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                    <image v-if="avatar" class="avatar" :src="avatar" mode="aspectFit"></image>
                    <text v-else class="no-avatar">获取头像</text>
                </button>
                <input class="input-wrap" placeholder-style="color:#93371A" v-model="nickname" type="nickname"
                    placeholder="请输入昵称" />
                <button v-if="IsNeedBindTel" @getphonenumber="getphonenumber" open-type="getPhoneNumber"
                    class="login-button">绑定手机并加入房间</button>
                <button v-else @tap="login()" class="login-button">加入房间</button>
            </view>
            <view class="tip">
                <text>为了有更好的游戏体验,请提供您的头像及昵称</text>
            </view>
        </view>
    </view>
</template>

<style scoped>
.popup-mask {
    position: fixed;
    z-index: 6;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.login-popup {
    padding: 50rpx 30rpx 30rpx 30rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-sizing: border-box;
}

.body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
}

.tip {
    display: block;
    opacity: 0.5;
    font-size: 22rpx;
    font-weight: bold;
    padding-top: 50rpx;
}

.avatar-wrapper {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    font-size: 20rpx;
    line-height: unset;
    padding: unset;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-wrapper::after {
    border: none;
}

.avatar {
    width: 100%;
    height: 100%;
}

.input-wrap {
    width: 100%;
    text-align: center;
    font-size: 28rpx;
    background-color: #F8F8F8;
    border-radius: 10rpx;
    height: 80rpx;
}

.login-button {
    width: 100%;
    font-size: 32rpx;
}
</style>