<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import {  defineEmits } from 'vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();

const props = defineProps({
    dialogObj: Object,
    userInfo: Object,
    teamInfo: Object,
    currentPage: String,
    newReplay: Number
});

const teamInfo = computed(() => memberStore.info?.teamInfo)
const userInfo = computed(() => memberStore.info?.characters[memberStore.virtualRoleId - 1])
const emit = defineEmits(['updateDialogObj']);

const modifyDialog = () => {
    dialogObj.value.dialogVisible = true
    emit('updateDialogObj', dialogObj);
};
const rankList = computed(() => {
  // 获取 rankList
  const list = memberStore.rankList;

  // 找到 roomid 为 20 的对象的索引
  const roomId20Index = list.findIndex(item => item.room_id === memberStore.roomId);

  // 初始化新数组
  let newList = [];

  // 如果找到 roomid = 20 的对象
  if (roomId20Index !== -1) {
    if (roomId20Index === 0) {
      // 如果 roomid = 20 的对象在第 0 位，取它的后两位
      newList = list.slice(0, 3); // 获取前3个对象（包括第0位）
    } else if (roomId20Index === 1) {
      // 如果 roomid = 20 的对象在第 1 位，取第 0 位和第 2 位
      newList = [list[0], list[1], list[2]];
    } else {
      // 如果 roomid = 20 的对象在其他位置，取它前一个和它本身
      newList = [list[0], list[roomId20Index - 1], list[roomId20Index]];
    }
  }

  // 返回重新排列后的数组
  console.log(newList)
  return newList;
});

watch(() => props.currentPage, (a, b) => {
    // if (a === 'TeamInfo') {
    //     webSocketStore.getRankInfo()
    // }
    // console.log(props.currentPage, 'ccc')
},
    { deep: true })
const dialogObj = ref({
    dialogVisible: false,
    title: '请输入您的昵称',
    content: '推荐使用昵称不超过十个字',
    confirmText: '确定',
    cancelText: '取消',
    showCancel: false, // 是否显示按钮
    type: 'changeTeamName',
})
const updateInfo = (info: any) => {
    webSocketStore.gameSend(
        info
    )
}
const changeAvatar = () => {
    // 首先获取token
    uni.request({
        url: 'http://kaiben.center.wanjuyuanxian.com/open/upload_token', // 获取token的接口
        method: 'GET',
        success: function (tokenRes) {
            if (tokenRes.statusCode === 200) {
                const token = tokenRes.data.data.token; // 获取到的token

                // 选择图片并上传
                uni.chooseImage({
                    count: 1, // 只允许选择一张图片
                    sizeType: ['compressed'], // 可以指定是原图还是压缩图
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机
                    success: function (res) {
                        const tempFilePath = res.tempFilePaths[0];
                        const xFormat = '.png'; // 根据文档，设定文件后缀名

                        // 使用uni.uploadFile上传图片
                        uni.uploadFile({
                            url: 'http://up-z2.qiniup.com/', // 替换为你实际的上传接口URL
                            filePath: tempFilePath,
                            name: 'file', // 对应接口中的file字段
                            formData: {
                                'x:format': xFormat,
                                'token': token
                            },
                            success: function (uploadRes) {
                                if (uploadRes.statusCode === 200) {
                                    // 解析返回的JSON数据
                                    const responseData = JSON.parse(uploadRes.data);
                                    const uploadedImageUrl = responseData.key; // 从响应中获取图片的URL

                                    // 保存到 memberStore.avatar
                                    memberStore.avatar = uploadedImageUrl;
                                    memberStore.info.characters[memberStore.virtualRoleId - 1].playerAvatar = uploadedImageUrl;
                                    updateInfo(memberStore.info);
                                    webSocketStore.updateInfo(memberStore.info.characters[memberStore.virtualRoleId - 1].user, uploadedImageUrl);
                                } else {
                                    console.error('图片上传失败', uploadRes);
                                }
                            },
                            fail: function (err) {
                                console.error('上传图片失败', err);
                            }
                        });
                    }
                });
            } else {
                console.error('获取token失败', tokenRes);
            }
        },
        fail: function (err) {
            console.error('请求token失败', err);
        }
    });
};


const avatarList = ['clue22', 'clue25', 'clue23', 'clue24', 'clue26', 'clue27',]
const showDialog = (e: any) => {
    console.log(e)
    dialogObj.value.dialogVisible = true
}
</script>

<template>
    <view class="team-info">
        <view class="user-avatar" @click="changeAvatar">
            <img class="user-avatar-img" src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/avatar_frame.png"
                alt="">
            <view
                style="background-color: black;position: absolute;margin-left: 15rpx;z-index: 1;height: 300rpx;width: 260rpx;margin-top: -360rpx;">
                <img style="height: 100%;width: 100%;"
                    :src="memberStore.info.characters[memberStore.virtualRoleId - 1].playerAvatar" alt="">
            </view>
        </view>
        <!-- `https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/${avatarList[memberStore.virtualRoleId - 1]}.png` -->
        <!-- ${avatarList[memberStore.virtualRoleId - 1]} -->
        <view class="character-avatar">
            <img class="character-avatar-img"
                src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/avatar_frame.png" alt="">
            <view
                style="background-color: black;position: absolute;margin-left: 15rpx;z-index: 1;height: 240rpx;width: 200rpx;margin-top: -260rpx;">
                <img style="height: 100%;width: 100%;"
                    :src="`https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/${avatarList[memberStore.virtualRoleId - 1]}.png`"
                    alt="">
            </view>
        </view>
        <!-- <view class="character-avatar">
            <img class="character-avatar-img" src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/avatar1.png" alt="">
        </view> -->

        <view class="team-info-box">
            <view class="staff-info flex-column-sb ">
                <view class="player-title hyshtj ">
                    <view class="font-player-gradient1">职员信息</view>
                </view>
                <view class="user-name font-player-gradient1" @tap="modifyDialog">
                    <!-- 厨师沙拉 -->
                    {{ userInfo?.user.slice(0, 10) }}
                    <img class="edit-icon" src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/edit_icon.png"
                        alt="">
                </view>
                <view class="team-name font-player-gradient1">
                    啥都接公司: {{ memberStore.info.teamInfo.name }} 小分队
                </view>
                <view class="team-level font-player-gradient1">
                    <text>队伍等级:</text>
                    <img v-if="teamInfo!.score === 0" class="level-icon"
                        src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/wu.png" alt="">
                    <img v-if="teamInfo!.score === 1" class="level-icon"
                        src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/ren.png" alt="">
                    <img v-if="teamInfo!.score === 2" class="level-icon"
                        src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/di.png" alt="">
                    <img v-if="teamInfo!.score === 3" class="level-icon"
                        src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/tian.png" alt="">
                </view>
                <view class="exp font-player-gradient1">
                    <text>个人经验: </text>
                    <view class="exp-icon" :style="{ width: ((userInfo!.score + 100) % 100) * 2.5 + 'rpx' }"></view>
                    <view class="exp-border flex-row-center">
                        <img v-if="userInfo!.score > 400" class="ding-icon"
                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/jia.png" alt="">
                        <img v-if="userInfo!.score < 400 && userInfo!.score > 300" class="ding-icon"
                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/yi.png" alt="">
                        <img v-if="userInfo!.score < 300 && userInfo!.score > 200" class="ding-icon"
                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/bing.png" alt="">
                        <img v-if="userInfo!.score < 200 && userInfo!.score > 100" class="ding-icon"
                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/ding.png" alt="">
                        <img v-if="userInfo!.score < 100" class="ding-icon"
                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/wu2.png" alt="">
                    </view>
                </view>
            </view>

            <view class="rank-info">
                <view class="player-title hyshtj">
                    <view class="font-player-gradient1">排行榜</view>
                </view>
                <view class="rank-box ">
                    <view class="make-old"></view>
                    <view :class="index === 0 ? 'rank-box-item-first' : 'rank-box-item'"
                        v-for="(item, index) in rankList" :key="index">
                        <view class="flex-row-sb"
                            :class="item.room_id === memberStore.roomId ? 'rank-box-item-me' : 'rank-box-item-other'">
                            <view class="flex-column-sb rank-box-left">
                                <view class="font-player-gradient1">{{ item.team_name }}</view>
                                <view>
                                    <view class="font-player-gradient1">分区第 {{ item.rank }} 名</view>
                                    <view v-if="item.room_id === memberStore.roomId ">
                                        <img class="rank-status-icon"
                                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/completed_icon.png"
                                            alt="">
                                        <text class="font-player-gradient1">完成时间: {{ item.time }}</text>
                                    </view>
                                    <view v-else>
                                        <img class="rank-status-icon turn"
                                            src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/underway_icon.png"
                                            alt="">
                                        <text class="underway-text">任务进行中</text>
                                    </view>
                                </view>
                            </view>
                            <view class="team-rank-level "
                                :class="item.room_id === memberStore.roomId  ? 'team-rank-level-bg0' : 'team-rank-level-bg1'">
                                <img v-if="item.level === 0" class="team-rank-level-icon"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/wu.png" alt="">
                                <img v-if="item.level === 6" class="team-rank-level-icon"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/ren.png" alt="">
                                <img v-if="item.level === 12" class="team-rank-level-icon"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/di.png" alt="">
                                <img v-if="item.level === 18" class="team-rank-level-icon"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/tian.png" alt="">
                            </view>
                        </view>
                        <view class="flex-row-center" style="height: 20rpx;" v-if="index === 0">
                            <view class="loading">
  <view></view>
  <view></view>
  <view></view>
</view>

                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<style scoped>
.exp-border {
    margin-left: -30rpx;
    width: 66.5rpx;
    height: 66.5rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/exp_border.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.make-old {
    position: absolute;
    z-index: 11;
    transform: rotate(2deg);
    height: 650rpx;
    width: 100%;
    margin-top: -10rpx;
    margin-left: -30rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/make_old.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    filter: invert(0.7) sepia(1) saturate(2) hue-rotate(-20deg) brightness(0.9) opacity(1);
}

.team-info {
    font-weight: 600;
    width: 100%;
    height: 100vh;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/teaminfo_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.staff-info {
    height: 340rpx
}

.rank-info {
    margin-top: 50rpx;
}

.exp {
    display: flex;
    align-items: center;
}

.rank-box {
    width: 665rpx;
    padding: 20rpx;
    box-sizing: border-box;
}

.rank-box-left {
    height: 145rpx;
}

.rank-box-item {
    height: 175rpx;
    position: relative;
    z-index: 12;
}

.rank-box-item-other {
    border: 2rpx solid #D4AA6E;
    box-sizing: border-box;
    margin-top: 20rpx;
    border-left: none;
    border-right: none;
}

.rank-box-item-me {
    border: 4rpx solid #BE3700;
    box-sizing: border-box;
    margin-top: 20rpx;
    border-left: none;
    border-right: none;
}

.rank-box-item-first {
    position: relative;
    z-index: 12;
    height: 195rpx;
}

.team-rank-level {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 15rpx 0;
    box-sizing: border-box;
    height: 100%;
    background-position: 0rpx 20rpx;
    background-size: 175rpx 155rpx;
    height: 175rpx;
    width: 175rpx;
}

.team-rank-level-bg0 {
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/circle1.png') no-repeat;
    background-size: 110% 100%;
    background-position: center;
}

.team-rank-level-bg1 {
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/circle2.png') no-repeat;
    background-size: 115% 100%;
    background-position: center;
}

.user-avatar {
    position: fixed;
    right: 10rpx;
    top: 30rpx;
    z-index: 1;
    width: 300rpx;
    height: 360rpx;
    z-index: 2;
    box-sizing: border-box;
}

.user-avatar-img {
    width: 300rpx;
    height: 360rpx;
    position: relative;
    z-index: 2;
}

.character-avatar {
    position: fixed;
    right: 40rpx;
    top: 270rpx;
    z-index: 2;
    transform: scale(0.8) rotate(10deg);
}

.character-avatar-img {
    position: relative;
    z-index: 2;
    width: 224rpx;
    height: 266rpx;
}

.team-info-box {
    position: absolute;
    top: 180rpx;
    padding-left: 30rpx;
    transform: rotate(-2deg);
}



.user-name {
    font-size: 35rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.team-name {}

.team-level {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.edit-icon {
    width: 38.5rpx;
    height: 40rpx;
}

.level-icon {
    width: 52.5rpx;
    height: 52.5rpx;
}

.team-rank-level-icon {
    width: 100rpx;
    height: 100rpx;
}

.exp-icon {
    width: 250rpx;
    height: 20rpx;
    margin-left: 30rpx;
    margin-top: 5rpx;
    background-color: rgba(194, 147, 79, 80);
}

.ding-icon {
    width: 45.5rpx;
    height: 40.5rpx;
}

.rank-status-icon {
    width: 20rpx;
    height: 20rpx;
}
.turn{
    animation: turn 2s linear infinite;
}
/* 
turn : 定义的动画名称
10s : 动画时间
linear : 动画平滑
infinite :使动画无限循环
transform:rotate(旋转角度)
%0:动画开始
%100:动画结束
*/
@keyframes turn {
    0% {
        transform: rotate(0deg);
    }

    20% {
        transform: rotate(72deg);
    }

    40% {
        transform: rotate(144deg);
    }

    60% {
        transform: rotate(216deg);
    }

    80% {
        transform: rotate(288deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.underway-text {
    color: #228300;
}

.loading,
.loading > view {
  position: relative;
  box-sizing: border-box;
  margin-bottom: -20rpx;
}

.loading {
  display: block;
  font-size: 0;
  color: #000;
}

.loading.la-dark {
  color: #333;
}

.loading > view {
  display: inline-block;
  float: none;
  background-color: currentColor;
  border: 0 solid currentColor;
}

.loading {
  width: 54rpx;
  height: 18rpx;
}

.loading > view:nth-child(1) {
  animation-delay: -200ms;
}

.loading > view:nth-child(2) {
  animation-delay: -100ms;
}

.loading > view:nth-child(3) {
  animation-delay: 0ms;
}

.loading > view {
  width: 10rpx;
  height: 10rpx;
  margin: 4rpx;
  border-radius: 100%;
  animation: ball-pulse 1s ease infinite;
}

.loading.la-sm {
  width: 26rpx;
  height: 8rpx;
}

.loading.la-sm > view {
  width: 4rpx;
  height: 4rpx;
  margin: 2rpx;
}

.loading.la-2x {
  width: 108rpx;
  height: 36rpx;
}

.loading.la-2x > view {
  width: 20rpx;
  height: 20rpx;
  margin: 8rpx;
}

.loading.la-3x {
  width: 162rpx;
  height: 54rpx;
}

.loading.la-3x > view {
  width: 30rpx;
  height: 30rpx;
  margin: 12rpx;
}

@keyframes ball-pulse {
  0%,
  60%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  30% {
    opacity: 0.1;
    transform: scale(0.01);
  }
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