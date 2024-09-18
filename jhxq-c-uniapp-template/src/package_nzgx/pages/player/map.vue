<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
import { allClues } from '@/package_nzgx/services/clues';
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();
import { defineProps, defineEmits } from 'vue';
import { addNewItem } from '@/package_nzgx/services/info';
const props = defineProps({
    dialogObj: Object,
    userInfo: Object,
    flow: Object,
    currentPage: String,
});

const emit = defineEmits(['updateDialogObj', "page"]);

const modifyDialog = () => {
    dialogObj.value.dialogVisible = true
    emit('updateDialogObj', dialogObj);
};

const audioIndex = ref(0)

const dialogObj = ref({
    dialogVisible: false,
    title: '请输入您的昵称',
    content: '推荐使用昵称不超过五个字',
    confirmText: '确定',
    cancelText: '取消',
    showCancel: false, // 是否显示按钮
    type: 'changeTeamName',
    hideCloseIcon: false,
    clue: ''
})
const userIndex = computed(() => memberStore.virtualRoleId - 1)
const faq = (item: any) => {
    console.log('faq', item)
    let newContent = '';
    item.qa.forEach(itema => {
        const questionText = itema.question.replace(/^\d+\.\s*/, '');
        newContent += questionText + '\n';
    });
    dialogObj.value.title = '你当前收到一条个人任务'
    dialogObj.value.confirmText = '确定'
    dialogObj.value.content = newContent
    dialogObj.value.type = 'newTask2'
    modifyDialog()
}
const updateInfo = (info: any) => {
    webSocketStore.gameSend(
        info
    )
}

const getStatus = (title: string) => {
    return computed(() => props.flow?.inner.find((item: { title: string; }) => item.title === title)?.status ?? 3);
};
const zfStatus = getStatus('开启逐风');
const zstStatus = getStatus('找尸体');
const grStatus = getStatus('个人线索发放+个人问题');
const ypStatus = getStatus('音频搜证');
const dtStatus = getStatus('地图搜证');
const glStatus = getStatus('卦灵');
const fyStatus = getStatus('封印动画');
const fyStatus2 = getStatus('封印动画2');
// ypContent[voiceIndex].users
const getYpUsers = (title: string) => {
    return computed(() => memberStore.info?.flow[memberStore.info.teamInfo.flowIndex].inner?.find((item: { title: string; }) => item.title === title)?.content[voiceIndex.value].users ?? null);
};
const ypUsers = getYpUsers('音频搜证');
const getContent = (title: string) => {
    return computed(() => memberStore.info?.flow[memberStore.info.teamInfo.flowIndex].inner?.find((item: { title: string; }) => item.title === title)?.content ?? null);
};
const zfContent = getContent('开启逐风');
const zstContent = getContent('找尸体');
const grContent = getContent('个人线索发放+个人问题');
const ypContent = getContent('音频搜证');
const dtContent = getContent('地图搜证');
const glContent = getContent('卦灵');
const fyContent = getContent('封印动画');
const fyContent2 = getContent('封印动画2');

const canJoin = ref(true)
const userJoinRoom = ref(-1)
const updateYpUsers = (user: number, newUserIndex: number, index: number, roomUserIndex: number) => {
    if (newUserIndex !== -1 && !canJoin.value) {
        uni.showToast({ icon: 'none', title: '你无法加入,请离开其他位置' })
        return
    }
    if (user === -1 || user === userIndex.value) {
        user = newUserIndex
        if (newUserIndex === -1) {
            canJoin.value = true; userJoinRoom.value = -1
        }
        else canJoin.value = false; userJoinRoom.value = index
    }
    memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '音频搜证').content[voiceIndex.value].users[roomUserIndex] = user
    updateInfo(memberStore.info)
}
// wx4d801e9058fb874c
const isNewClueShow = ref(false)
const isDeepClue = ref(false)
const voiceIndex = ref(-1)
const newClueSrc = ref('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/clue2.png')
const oldClueSrc = ref('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/clue1.png')
watch(() => canJoin, () => {
    console.log(canJoin)
})
watch(() => props.currentPage, (a, b) => {
    if (a === 'TeamInfo') {
        webSocketStore.getRankInfo()
    }
    console.log(props.currentPage, 'ccc')
},
    { deep: true })
watch(() => memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '音频搜证').content[userJoinRoom.value], (a, b) => {
    // console.log(a, b, userJoinRoom.value)
    if (!a || !a.result || a.result === '' || (a !== undefined && b === undefined) || (a.users[0] === -1 || a.users[1] === -1)) {
        return
    }
    if (a.result === '已验证成功') return
    if (a.result === '验证成功') {
        dialogObj.value.title = '推理成功'
        dialogObj.value.content = '收获一条音频线索'
        dialogObj.value.type = 'voice'
        dialogObj.value.confirmText = '收入线索集'
        dialogObj.value.hideCloseIcon = true
        dialogObj.value.clue = a.clue
        memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '音频搜证').content[userJoinRoom.value].result = '已验证成功'
        voiceIndex.value = -1
        userJoinRoom.value = -1
        canJoin.value = true
        updateInfo(memberStore.info)
        // addNewItem(userIndex.value, a.clue, 0, 'audio', '')
        modifyDialog()
    } else {
        memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '音频搜证').content[userJoinRoom.value].users = [-1, -1]
        dialogObj.value.title = '推理失败'
        dialogObj.value.content = a.result
        dialogObj.value.type = 'matchResult'
        dialogObj.value.confirmText = '确定'
        dialogObj.value.hideCloseIcon = true
        memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '音频搜证').content[userJoinRoom.value].result = ''
        voiceIndex.value = -1
        userJoinRoom.value = -1
        canJoin.value = true
        updateInfo(memberStore.info)
        modifyDialog()
    }
},
    { deep: true })

const filterLocations = (list: any) => {
    if (dtStatus.value === 2) {
        const newList = list.filter(item => dtContent.value[0].locations.includes(item.id))
        if (newList.every(item => item.isShow === false)) {
            memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '地图搜证').status = 3
            updateInfo(memberStore.info)
        }
        return newList;
    } else {
        return list
    }
};
const mapSerch = (clue: string, id: number, isShow: boolean) => {
    if (!isShow) {
        return
    }
    if (dtStatus.value === 2) {
        memberStore.info.locationList[id].clue = ''
        memberStore.info.locationList[id].isShow = false
        // addNewItem(userIndex.value, clue, 0, 'clues', '')
        for (let index = 0; index < memberStore.info.characters.length; index++) {
            let isCurrentRole = (memberStore.virtualRoleId - 1) !== index;
            memberStore.info.characters[index].cueset['clues'].push(
                {
                    name: clue,
                    isNew: isCurrentRole? true : false,
                    deepClue: '',
                    type: 0,
                    isRead: false,
                    timestamp: Date.now() // 当前时间戳
                }
            );
        }
        updateInfo(memberStore.info)
    }
}

</script>
<template>

    <view class="map">
        <!-- 地图搜证 -->
        <view class="map-search" v-for="(item, index) in filterLocations(memberStore.info.locationList)"
            :key="item.name" v-if="(zstStatus === 2 && ypStatus === 0) || (dtStatus === 2 && glStatus === 0)"
            @tap="mapSerch(item.clue, item.id, item.isShow)" :style="{ filter: item.isShow ? '' : 'brightness(50%)' }">
            <view class="location flex-row-center hyshtj" :style="{ top: item.position.top, left: item.position.left }">
                {{ item.name }}
            </view>
            <img :style="{ top: item.position.iconTop, left: item.position.iconLeft }" class="location-icon"
                src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/location_icon.png" alt="">
        </view>
        <!-- 音频搜证地点 -->
        <view class="audio-search" @tap="voiceIndex = index" v-for="(item, index) in ypContent" :key="item.name"
            v-show="ypStatus === 2 && dtStatus === 0 && item.status !== 3">
            <view class="audio-serach-location flex-row-center hyshtj" @tap="audioIndex = index"
                :style="{ top: item.position.top, left: item.position.left, zIndex: audioIndex === index ? '10011' : '1' }">
                <view v-if="item.users[0] !== -1" class="audio-serach-location-avatar">
                    <img class="audio-serach-location-avatar-img"
                        :src="memberStore.info.characters[ypContent[index].users[0]].avatar" alt="">
                </view>
                <view v-if="item.users[1] !== -1" class="audio-serach-location-avatar"
                    style="margin-left: 80rpx;z-index: -1;">
                    <img class="audio-serach-location-avatar-img"
                        :src="memberStore.info.characters[ypContent[index].users[1]].avatar" alt="">
                </view>

                {{ item.name }}
            </view>
        </view>

        <!-- 音频搜证选择地点入座 -->
        <view>
            <view class="dialog-mask" :class="{ show: voiceIndex !== -1 }" v-if="voiceIndex !== -1"
                :style="{ background: dialogObj.dialogVisible ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.6)' }">
                <view class="dialog-inner">
                    <view class="dialog-header">
                    </view>
                    <text class="hyshtj font-player-gradient1 dialog-title">{{ ypContent[voiceIndex].name
                        }}传来一些声音</text>
                    <view class="dialog-content">
                        这里似乎有人交流过，请找出在此处交流的二人。
                    </view>

                    <view class="flex-row-sb avatar-box">
                        <view class="avatar flex-row-center" v-for="(item, index) in 2" :key="index">
                            <view @tap="updateYpUsers(ypUsers[index], userIndex, voiceIndex, index)"
                                class="flex-row-center" style="width: 80rpx;height: 80rpx;"
                                v-if="ypUsers[index] === -1">+
                            </view>
                            <img v-if="memberStore.info.characters[ypUsers[index]] && ypUsers[index] !== -1"
                                :src="memberStore.info.characters[ypUsers[index]].avatar" alt="">

                            <img v-if="ypUsers[index] === userIndex"
                                @tap="updateYpUsers(ypUsers[index], -1, voiceIndex, index)" class="out-btn"
                                src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/out_btn_icon.png" alt="">
                        </view>

                    </view>

                    <view class="dialog-control hyshtj">
                        <view @tap="voiceIndex = -1" class="theme-button button">
                            <view class="theme-button-clear "></view>
                            <view class="font-player-gradient2 hyshtj">返回</view>
                        </view>
                    </view>

                </view>
            </view>
        </view>

        <!-- 个人任务 -->
        <view class="FAQ" @tap="faq(userInfo!.mask.slice(-1)[0])"
            v-if="userInfo && userInfo!.mask.slice(-1)[0] && userInfo!.mask.slice(-1)[0].type === 0">
        </view>

        <!-- 开启逐风 -->
        <view class="newClue-mask"
            v-if="zfStatus === 3 && memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner[1].status === 0">
            <view class="zhufeng">
            </view>
            <view class="zhufeng-text">我是逐风，我可以帮你梳理信息，
                并帮你找到最符合逻辑的答案</view>
        </view>
    </view>
</template>

<style scoped>
.audio-serach-location-avatar {
    width: 40rpx;
    height: 40rpx;
    margin-left: 140rpx;
    position: absolute;
    margin-top: -80rpx;
    background-color: #DDCDB8;
    border: 2rpx solid #C2934F;
    /* box-sizing: border-box; */
    border-radius: 999rpx;
}

.audio-serach-location-avatar-img {
    width: 40rpx;
    height: 40rpx;
}

.show {
    opacity: 1;
    animation: 1s changeShow;
}

.hide {
    opacity: 0;
}

.isScale {
    transform: scale(1.5)
}

.notScale {
    transform: scale(1.1)
}

.newClue-mask {
    width: 100%;
    height: 100vh;
    position: fixed;
    z-index: 12000;
    background-color: rgba(0, 0, 0, 0.6);
}

.newClue-img {
    opacity: 0;
    width: 70%;
}

.newClue-img-A-rotate {
    transform: rotateY(180deg);
    opacity: 0;
}

.newClue-img-B-rotate {
    transform: rotateY(180deg);
    opacity: 1;
}

.hide {
    opacity: 0;
}

.newClue-img-A {
    width: 100%;
    position: absolute;
    transition: all 2s;
    z-index: 1;
    backface-visibility: hidden;
}

.newClue-img-B {
    width: 100%;
    position: absolute;
    transition: all 2s;
    object-fit: contain;
    /* transform: rotatey(1turn); */
}

.newClue-title {
    font-size: 35rpx;
    margin-top: -20rpx;
    pointer-events: all;
}

.newClue {
    height: 900rpx;
    width: 90%;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/paper5.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    padding: 100rpx;
    box-sizing: border-box;
}

@keyframes changeShow {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.newClue-btn-text {
    margin-top: -18rpx;
    -webkit-text-stroke: 2rpx #670100;
    -webkit-text-fill-color: #F4E7D3;
    font-size: 32rpx;
    color: #fff;
    font-weight: 400;
}

.out-btn {
    position: absolute;
    margin-top: -80rpx;
    margin-right: -80rpx;
    width: 40rpx;
    height: 40rpx;
}

.avatar-box {
    gap: 70rpx;
}

.avatar {
    width: 110rpx;
    height: 110rpx;
    border-radius: 999rpx;
    background-color: rgba(194, 147, 79, 70);
}

.map {
    width: 100%;
    height: 100vh;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/map2.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.audio-serach-location {
    width: 170rpx;
    height: 167rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/audio_search_location_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    font-size: 26.5rpx;
    padding-bottom: 40rpx;
    padding-left: 5rpx;
    box-sizing: border-box;
    position: fixed;
}

.location {
    width: 201rpx;
    height: 104rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/location_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    font-size: 31.5rpx;
    padding-bottom: 30rpx;
    padding-left: 10rpx;
    box-sizing: border-box;
    position: fixed;
}

.location-icon {
    width: 47rpx;
    height: 57rpx;
    position: fixed;
}

.FAQ {
    width: 200rpx;
    height: 200rpx;
    position: fixed;
    bottom: -20rpx;
    right: -20rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/FAQ.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    pointer-events: all;
}

.zhufeng {
    width: 140rpx;
    height: 200rpx;
    top: 20rpx;
    left: 0rpx;
    position: fixed;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/zhufeng.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.zhufeng-text {
    padding: 70rpx 100rpx 100rpx 180rpx;
    font-size: 30rpx;
    color: #ECD7BD;
}

.dialog-mask {
    position: fixed;
    z-index: 15000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 40rpx;
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    transition: .3s ease;
    transition-property: opacity;
}

.dialog-mask.show {
    opacity: 1;
    pointer-events: unset;
}

.dialog-mask.show>.dialog-inner {
    transform: translateY(0px);
}

.dialog-inner {
    width: 100%;
    /* max-width: 600rpx; */
    /* background-color: #FFF;
    border-radius: 24px; */
    display: flex;
    align-items: center;
    flex-direction: column;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    padding: 60rpx 130rpx 90rpx 130rpx;
    box-sizing: border-box;
    transform: translateY(20px);
    transition: .3s ease;
    transition-property: transform;
    text-align: center;
}

.dialog-header {
    width: 95%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.dialog-header>text {
    font-size: 34rpx;
    font-weight: bold;
}

.dialog-header>image {
    width: 48rpx;
    min-width: 48rpx;
    height: 48rpx;
}

.dialog-title {
    font-size: 40rpx;
}

.dialog-content {
    padding: 20rpx 0;
    color: #000;
    font-size: 28rpx;
}

.dialog-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
    margin-top: 40rpx;
}

.theme-button {
    width: 245rpx;
    line-height: 94.5rpx;
    font-size: 28rpx;
    /* border-radius: 16px; */
    font-weight: bold;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_btn1.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.theme-button2 {
    width: 245rpx;
    position: relative;
    z-index: 14000;
    line-height: 124.5rpx;
    font-size: 28rpx;
    /* border-radius: 16px; */
    font-weight: bold;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/new_clue_btn.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.theme-button-clear {
    position: absolute;
    width: 185rpx;
    height: 95.5rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_btn2.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    filter: brightness(100) contrast(100%) opacity(0.5);
}
</style>
<style>
@import url("@/package_nzgx/static/fonts/stylesheet.css");
@import url("@/package_nzgx/styles/common.css");

.almm {
    font-family: 'Alimama ShuHeiTi';
}

.hyshtj {
    font-family: 'hyshtj';
}
</style>