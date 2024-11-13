<script setup lang='ts'>
import LoginPopup from "@/components/LoginPopup/index.vue";
import { computed, ref, watch } from 'vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
import { WebSocketService } from '@/package_nzgx/services/WebSocketService';
import { LemToken } from "@/utils/auth";
import { useMainAuthStore } from "@/stores/auth";
const emit = defineEmits(["page"]);
const memberStore = useMemberStore()
const MainAuthStore = useMainAuthStore()
const webSocketStore = useWebSocketStore();
const RoleId = computed(() => MainAuthStore.RoleId);
const IsTestPlay = computed(() => MainAuthStore.IsTestPlay);
const keys = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', 'clear', '零', 'backspace', '启']
const roomNumber = ref('')
const roomId = ref('')
const loginVisible = ref<boolean>(false);
const connectCount = ref<number>(0)
const currentRoomId = (index: number,item:any) => {
    if (roomNumber.value.length < 8){
        roomNumber.value += item; 
    } else return
    if (index >= 0 && index < 9) {
        roomId.value += index + 1 + ''
    } else if (index = 10) {
        roomId.value += '0'
    }
}


const toPlay = () => {
    console.log(roomNumber.value,roomId.value)
    loginVisible.value = true;
}

const play = async({ avatar, nickname }: { avatar: string, nickname: string }) => {
    const token = LemToken.get();
    let avatarUrl = avatar;
    let nickName = nickname;
    console.log('微信头像:', avatarUrl);
    console.log('微信昵称:', nickName);
    memberStore.avatar = avatarUrl;
    const _roomId = roomId.value;
    await MainAuthStore.JoinRoom(RoleId.value, _roomId);
    memberStore.setRoomId(_roomId);
    memberStore.setProfile({ token });
    memberStore.setVirtualRoleId(MainAuthStore.RoleId);
    console.log(memberStore.profile)
    console.log(memberStore.roomId)
    console.log(memberStore.virtualRoleId)
    // 创建 WebSocket 连接
    if (!(memberStore.profile.token && memberStore.roomId && memberStore.virtualRoleId)) {
        return
    }
    //显示加载框
    uni.showLoading({
        title: '加载中'
    });
    const wsService = new WebSocketService(`token=${memberStore.profile.token}&room_id=${memberStore.roomId}&virtual_role_id=${memberStore.virtualRoleId}`);
    // 监听连接错误或关闭事件
    wsService.onError = (error) => {
        console.error("WebSocket 连接失败", error);
        uni.showToast({ icon: 'none', title: '数据异常，连接失败，请重新扫码' })
        uni.exitMiniProgram({
            success: function () {
                uni.clearStorageSync();
                console.log('退出小程序成功');
            },
            fail: function (err) {
                console.log('退出小程序失败', err);
            }
        })
        // 在这里可以添加错误处理逻辑
    };

    // 监听 WebSocket 连接断开事件
    wsService.onClose = () => {
        // 在这里添加断开连接后的处理逻辑，例如重新连接或通知用户
        // uni.showToast({ icon: 'none', title: '你已经断开连接' })
        if ((webSocketStore.messages.slice(-1)[0] && webSocketStore.messages.slice(-1)[0].type && webSocketStore.messages.slice(-1)[0].type === 'kicked')) {
            emit('page', 'RoomNumber')
            memberStore.roomId = ''
            uni.showModal({
                title: '提示',
                content: '房间已经关闭或您已被踢出房间或您暂时无法加入该房间，请重新扫描二维码',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        uni.exitMiniProgram({
                            success: function () {
                                uni.clearStorageSync();
                                console.log('退出小程序成功');
                            },
                            fail: function (err) {
                                console.log('退出小程序失败', err);
                            }
                        })
                    } else {
                        console.log('点击了取消')
                    }
                }
            })
        }else{
            // 断开后尝试重新连接三次
            if (connectCount.value < 3) {
                connectCount.value ++
                wsService.connect()
            }
        }
    };
    wsService.connect()
    setTimeout(() => {
        if (webSocketStore.messages.slice(-1)[0] && webSocketStore.messages.slice(-1)[0].type && webSocketStore.messages.slice(-1)[0].type === 'error') {
            uni.showToast({ icon: 'error', title: webSocketStore.messages.slice(-1)[0].message })
            webSocketStore.messages = []
        } else {
            webSocketStore.gameWebSocketService = wsService;
            webSocketStore.gameplayerFirstSend()
            webSocketStore.getPlayerInfo()
            webSocketStore.updateInfo(nickName, avatarUrl)
            setTimeout(() => {
                uni.hideLoading();
                if (memberStore.info) {
                    memberStore.info.characters[memberStore.virtualRoleId - 1].playerAvatar = avatarUrl
                    memberStore.info.characters[memberStore.virtualRoleId - 1].user = nickName
                    webSocketStore.gameSend(
                        memberStore.info
                    )
                }
                if (IsTestPlay.value && Object.keys(memberStore.playerInfo.players).length > 8) {
                    uni.showToast({ icon: 'none', title: '无法加入' })
                    webSocketStore.gameClose()
                    return
                } else {
                    uni.showToast({ icon: 'success', title: '加入成功' })
                    emit('page', 'TeamInfo')
                }
            }, 2000);
        }
    }, 1500);
}
</script>

<template>
    <LoginPopup @success="play" v-model:show="loginVisible"></LoginPopup>
    <view class="room-number hyshtj">
        <view class="fu">
            <view class="input flex-row-center">
                {{ roomNumber }}
            </view>
            <view class="num-key">
                <view v-for="(item, index) in keys" :key="index">
                    <view v-show="item !== 'clear' && item !== 'backspace' && item !== '启'"
                        class="num-key-btn flex-row-center" @tap="currentRoomId(index,item)">
                        <text class="number">{{ item }}</text>
                    </view>
                    <view v-show="item === 'backspace'" class="num-key-btn flex-row-center"
                        @tap="roomNumber = roomNumber.slice(0, -1); roomId = roomId.slice(0, -1)">
                        <img class="icon" src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/backspace_icon.png"
                            alt="">
                    </view>
                    <view v-show="item === 'clear'" class="num-key-btn flex-row-center"
                        @tap="roomNumber = ''; roomId = ''">
                        <img class="icon1" src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/clear_icon.png"
                            alt="">
                    </view>
                    <view v-show="item === '启'" class="num-key-btn flex-row-center" @tap="toPlay">
                        <text class="number">{{ item }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<style scoped>
.room-number {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/room_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.fu {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.input {
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/input_bg.png');
    background-size: contain;
    height: 108.5rpx;
    width: 445.5rpx;
    margin-top: 450rpx;
    color: #FCC825;
    font-size: 42rpx;
}

.num-key {
    width: 515.5rpx;
    height: 600rpx;
    margin-top: 10rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.num-key-btn {
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/number_bg.png');
    background-size: contain;
    width: 170rpx;
    height: 170rpx;
}

.icon {
    width: 35rpx;
    height: 35rpx;
    margin-top: -20rpx;
}

.icon1 {
    width: 60rpx;
    height: 60rpx;
    margin-top: -20rpx;
    margin-left: 10rpx;
}

.number {
    font-size: 45rpx;
    margin-top: -20rpx;
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