<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import dmDialog from '@/package_nzgx/components/playerDialog.vue';
import fourInOne from '@/package_nzgx/pages/player/components/fourInOne.vue';
import jump from '@/package_nzgx/pages/player/components/jump.vue';
import RoomNumber from './room-number.vue'
import TeamInfo from './team-info.vue'
import ZfMap from './map.vue'
import Gualing from './gualing.vue'
import CueSet from './cue-set.vue'
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
import { WebSocketService } from '@/package_nzgx/services/WebSocketService';
import { initAllInfo, updateOriFlowInfo } from '@/package_nzgx/services/initInfo';
import { allClues, updateOriClueInfo } from '@/package_nzgx/services/clues';
import { saveViewAsImage } from '@/package_nzgx/utils/saveViewAsImage';
import { addNewItem } from '@/package_nzgx/services/info';
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();
const currentPage = ref('RoomNumber')
const newReplay = ref(0)
const canDialog = ref(true)
const dialogObj = ref({
    dialogVisible: false,
    title: '请输入您的昵称',
    content: '推荐使用昵称不超过五个字',
    confirmText: '确定',
    cancelText: '取消',
    showCancel: false, // 是否显示按钮
    type: 'changeTeamName',
    clue: 'clue19',
    hideCloseIcon: false
})
const isArrayEqual = (a: [], b: []) => {
    // 判断数组长度是否相等
    if (a.length !== b.length) return false;

    // 深度比较每个对象
    return a.every((item, index) => isObjectEqual(item, b[index]));
}

function isObjectEqual(obj1, obj2) {
    // 如果两个对象是同一个引用，则相等
    if (obj1 === obj2) return true;

    // 如果类型不同，则不相等
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false;
    }

    // 获取对象的键数组
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // 比较键的长度
    if (keys1.length !== keys2.length) return false;

    // 逐个比较每个键和值
    for (let key of keys1) {
        if (!keys2.includes(key) || !isObjectEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}
const closeDialog = (val: any) => {
    console.log(val)
    dialogObj.value.dialogVisible = false
}
const confirm = (val: any) => {
    console.log(val)
    dialogObj.value.dialogVisible = false
    if (dialogObj.value.type === 'newReplay') {
        currentPage.value = 'CueSet'
        newReplay.value++
    }
}
const updateInfo = (info: any) => {
    webSocketStore.gameSend(
        info
    )
}
const updateDialogObj = (newDialogObj: any) => {
    dialogObj.value = newDialogObj.value
}
const pageJump = (val: any) => {
    console.log(val)
    currentPage.value = val
}
const getContent = (title: string) => {
    return computed(() => memberStore.info?.flow[memberStore.info.teamInfo.flowIndex].inner?.find((item: { title: string; }) => item.title === title)?.content ?? null);
};
const getStatus = (title: string) => {
    return computed(() => memberStore.info?.flow[memberStore.info.teamInfo.flowIndex].inner?.find((item: { title: string; }) => item.title === title)?.status ?? null);
};
const glContent = getContent('卦灵');
const glStatus = getStatus('卦灵');
    watch(() => memberStore.info.flow[3].send, (a, b) => {
        if (a !== b && a !== undefined && b !== undefined) {
            console.log('show', a, b)
            isPosterShow.value = true
        }
    })
    watch(() => currentPage.value, (a, b) => {
        if (a === 'TeamInfo') {
            webSocketStore.getRankInfo()
        }
        console.log(currentPage.value, 'ccc')
    },
        { deep: true })
    watch(() => memberStore.info.flow[0].inner[1].status, (a, b) => {
        console.log(a, b)
        if (a === 3 && b == 2) {
            setTimeout(() => {
                isNewClueShow.value = false
                isFourInOneShow.value = true
                setTimeout(() => {
                    isNewClueShow.value = true
                    isFourInOneShow.value = false
                }, 3000)
            }, 3000);
        }
    }, { deep: true })
    watch(() => memberStore.info.characters[userIndex.value].cueset.clues, (a, b) => {
        if (currentPage.value === 'RoomNumber' || !canDialog.value) return
        console.log('isclues', a, b)
        const newclue = memberStore.info.characters[userIndex.value].cueset.clues.slice(-1)[0];
        if (!newclue) {
            return
        }
        if (isArrayEqual(a, b) && newclue.type !== 2 && newclue.type !== 0) return
        console.log('ab不等')
        if (!newclue.isRead && newclue.isNew) {
            switch (newclue.type) {
                case 0:
                    if (memberStore.info.characters[userIndex.value].cueset.clues.length > 9 && newclue.name === 'clue1') return
                    isNewClueShow.value = false;
                    isNewClueShow.value = true;
                    isDeepClue.value = false;
                    newClueSrc.value = `https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/${newclue.name}.png`;
                    break;
                case 1:
                    console.log('个人线索')
                    dialogObj.value.title = '获得新线索';
                    dialogObj.value.content = '您获得新的6条个人线索，请前往线索集查看';
                    dialogObj.value.type = 'getClues';
                    dialogObj.value.confirmText = '查看';
                    dialogObj.value.dialogVisible = true
                    break;
                case 2:
                    console.log('2')
                    if (newClueSrc.value === allClues[newclue.name].url + '.png') return
                    inAni.value = false
                    isRotate.value = false
                    isScale.value = false
                    isNewClueShow.value = false;
                    isNewClueShow.value = true;
                    isDeepClue.value = true;
                    newClueSrc.value = allClues[newclue.name].url + '.png';
                    oldClueSrc.value = allClues[newclue.deepClue].url + '.png';
                    break;
                case 3:
                    dialogObj.value.title = '个人任务成功';
                    dialogObj.value.content = '获得一条深入线索';
                    dialogObj.value.type = 'success';
                    dialogObj.value.confirmText = '查看';
                    dialogObj.value.dialogVisible = true
                    // memberStore.info.characters[userIndex.value].cueset.clues.slice(-1)[0].type = 2
                    console.log(memberStore.info.characters[userIndex.value].mask.slice(-1)[0].type)
                    if (memberStore.info.characters[userIndex.value].mask.slice(-1)[0].type !== -1) memberStore.info.characters[userIndex.value].mask.slice(-1)[0].type = 2;
                    break;
                default:
                    // 处理未定义的类型
                    console.warn('未处理的线索类型:', newclue.type);
            }
        }
    },
        { deep: true })
    watch(() => memberStore.info.teamInfo.replay, (a, b) => {
        if (currentPage.value === 'RoomNumber' || !canDialog.value) return
        if (isArrayEqual(a, b)) return
        // if (!isArrayEqual(a.userRead, b.userRead)) return
        // 遍历比较每组 userRead
        const isEqual = a.every((newGroup, index) => {
            const oldGroup = b[index];
            // 比较新旧 userRead 是否相等
            return newGroup.userRead.length === oldGroup.userRead.length &&
                newGroup.userRead.every((val, i) => val === oldGroup.userRead[i]);
        });
        console.log(a, b, isEqual);
        if (!isEqual) return
        if (JSON.stringify(a) !== JSON.stringify(b) && a !== undefined && b !== undefined) {
            dialogObj.value.dialogVisible = true;
            dialogObj.value.title = '你收到新的复盘记录';
            dialogObj.value.content = '需要查看复盘记录吗';
            dialogObj.value.confirmText = '确定';
            dialogObj.value.hideCloseIcon = false;
            dialogObj.value.type = 'newReplay';
        }
    },
        { deep: true })
    watch(() => memberStore.info.characters[memberStore.virtualRoleId - 1].mask, (a, b) => {
        if (currentPage.value === 'RoomNumber' || !canDialog.value) return
        console.log(a, b)
        if (a.length === 0 || b.length === 0) {
            return
        }
        const newqa = memberStore.info.characters[memberStore.virtualRoleId - 1].mask.slice(-1)[0]
        if (newqa.type === 0) {
            if (newqa.isError) {
                dialogObj.value.dialogVisible = true
                dialogObj.value.title = '个人任务失败'
                dialogObj.value.content = '询问一下同伴吧'
                dialogObj.value.confirmText = '确定'
                dialogObj.value.hideCloseIcon = true
                dialogObj.value.type = 'error'
            }
            if (newqa.isNew) {
                let newContent = '';
                // 遍历 qalist 数组
                newqa.qa.forEach(item => {
                    // 使用正则表达式去掉序号部分
                    const questionText = item.question.replace(/^\d+\.\s*/, '');
                    // 将问题拼接到 newContent 中，并添加换行符
                    newContent += questionText + '\n';
                });

                dialogObj.value.dialogVisible = true
                dialogObj.value.title = '你当前收到一条个人任务'
                dialogObj.value.confirmText = '确定'
                dialogObj.value.content = newContent
                dialogObj.value.hideCloseIcon = true
                dialogObj.value.type = 'newTask'
            }
        } else if (newqa.type === -1) {
            setTimeout(() => {
                memberStore.info.characters[memberStore.virtualRoleId - 1].mask.slice(-1)[0].type = 0
                updateInfo(memberStore.info)
            }, 5000);
        }

    },
        { deep: true })
    watch(() => glStatus.value, (a, b) => {
        console.log('glstatus', glStatus.value)
        if (a === b) return
        if (glStatus.value === 2) {
            currentPage.value = 'Gualing'
        }

    },
        { deep: true })
const teamInfo = computed(() => memberStore.info?.teamInfo)
const userInfo = computed(() => memberStore.info?.characters[memberStore.virtualRoleId - 1])
const flow = computed(() => memberStore.info?.flow[memberStore.info.teamInfo.flowIndex])
const isNewClueShow = ref(false)
const isDeepClue = ref(false)
const newClueSrc = ref('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/clue2.png')
const oldClueSrc = ref('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/clue1.png')
const requiredClues = ['clue1', 'clue2', 'clue3', 'clue4'];
const isRotate = ref(false)
const isScale = ref(false)
const clue5 = ref(false)
const userIndex = computed(() => memberStore.virtualRoleId - 1)
const sortedClues = ref();
const updateClues = () => {
    memberStore.info.characters[userIndex.value].cueset.clues.forEach(element => {
        element.isNew = false
        element.type = 4
    });
    memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues = memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues.filter((clue, index, self) =>
        index === self.findIndex((c) => c.name === clue.name)
    );
    updateInfo(memberStore.info)
}
const ani = () => {
    if (inAni.value === true) return
    inAni.value = true
    isRotate.value = true
    setTimeout(() => {
        isScale.value = true
    }, 1000);
}
const inAni = ref(false)
onMounted(async () => {
    // 获取最新的原始流程信息和线索集信息
    uni.showLoading({
        title: '加载中'
    });
    await updateOriFlowInfo()
    await updateOriClueInfo()
    uni.hideLoading()
    if (!memberStore.info){
        memberStore.setInfo(initAllInfo)
        // memberStore.setVirtualRoleId(0)
    }
    // 创建 WebSocket 连接
    // 检查是否已经存在WebSocket连接
    if (webSocketStore.gameWebSocketService && webSocketStore.gameWebSocketService.isConnected()) {
        console.log("WebSocket 已经连接，无需重新连接");
        webSocketStore.gameplayerFirstSend()
        uni.showToast({ icon: 'none', title: '你已经成功重新连接' })
        console.log("WebSocket 连接成功");
        currentPage.value = 'TeamInfo'
        return;
    }
    if (!(memberStore.profile && memberStore.profile.token && memberStore.roomId && memberStore.virtualRoleId)) {
        return
    }
    const wsService = new WebSocketService(`token=${memberStore.profile.token}&room_id=${memberStore.roomId}&virtual_role_id=${memberStore.virtualRoleId}`);
    console.log(wsService)
    // 监听连接错误或关闭事件
    wsService.onError = (error) => {
        console.error("WebSocket 连接失败", error);
    };

    // 监听 WebSocket 连接断开事件
    wsService.onClose = () => {
        // 在这里添加断开连接后的处理逻辑，例如重新连接或通知用户
        uni.showToast({ icon: 'none', title: '你已经断开连接' })
        if (webSocketStore.messages.slice(-1)[0] && webSocketStore.messages.slice(-1)[0].type && webSocketStore.messages.slice(-1)[0].type === 'kicked') {
            currentPage.value = 'RoomNumber'
            memberStore.roomId = ''
            uni.showModal({
                title: '提示',
                content: '房间已经关闭或你已被踢出房间，请重新扫描二维码',
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
        }
    };
    wsService.connect()
    // 监听 WebSocket 连接成功事件
    wsService.onOpen = () => {
        if (webSocketStore.messages.slice(-1)[0] && webSocketStore.messages.slice(-1)[0].type && webSocketStore.messages.slice(-1)[0].type === 'error') {
            return
        }
        uni.showToast({ icon: 'none', title: '你已经成功连接' })
        console.log("WebSocket 连接成功");
        currentPage.value = 'TeamInfo'
        // 连接成功后执行后续操作
        webSocketStore.gameWebSocketService = wsService;
        // webSocketStore.gameConnect();
        setTimeout(() => {
            webSocketStore.gameplayerFirstSend()
        }, 500);
        canDialog.value = false
        setTimeout(() => {
            canDialog.value = true
        }, 2000);

    };
});

onUnmounted(() => {
    webSocketStore.gameClose();
});
const isPosterShow = ref(false)
const back = () => {
    console.log('back')
    isPosterShow.value = false
}
const handleSaveImage = async () => {
    uni.showLoading({
        title: '正在生成'
    })
    try {
        console.log(memberStore.info?.characters[memberStore.virtualRoleId - 1].user.slice(0, 10), memberStore.info.characters[memberStore.virtualRoleId - 1]?.name, getCurrentFormattedDate(), memberStore.info.teamInfo.location, memberStore.info.teamInfo.dmName)
        await saveViewAsImage('content-view', 'contentCanvas',memberStore.info?.characters[memberStore.virtualRoleId - 1].user.slice(0, 10)??'', memberStore.info.characters[memberStore.virtualRoleId - 1]?.name??'', getCurrentFormattedDate(), memberStore.info.teamInfo.location??'', memberStore.info.teamInfo.dmName??'');
        uni.hideLoading()
        console.log('图片已成功保存到相册');
    } catch (error) {
        uni.hideLoading()
        console.error('保存图片时出错：', error);
    }
};
const getCurrentFormattedDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() 返回的月份是从 0 开始的，所以需要加 1
    const day = now.getDate();

    return `${year}/${month}/${day}`;
}
const isFourInOneShow = ref(false)
</script>

<template>
    <view>
        <!-- 新线索+深入线索动画弹窗 -->
        <view class="newClue-mask flex-row-center" v-if="isNewClueShow">
            <view :class="isScale ? 'notScale' : 'isScale'" v-if="isDeepClue"
                style="transition: all 2s;;position: absolute;z-index: 13000;width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;padding-bottom: 120rpx;">
                <img mode='aspectFit' class="newClue-img-A" :class="isRotate ? 'newClue-img-A-rotate' : ''" @tap="ani()"
                    :src="oldClueSrc" alt="">
                <view
                    style="transform: rotateY(180deg);width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
                    <img mode='aspectFit' class="newClue-img-B"
                        :style="{ width: newClueSrc === 'https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/clue49.png' ? '70%' : '100%' }"
                        :class="isRotate ? 'newClue-img-B-rotate' : 'hide'" :src="newClueSrc" alt="">
                </view>
            </view>
            <view v-show="!isScale && isDeepClue"
                style="color: white;width: 100%;text-align: center;position: fixed;bottom: 200rpx;">
                点击图片翻转</view>
            <view class="newClue flex-column-sb-center" :class="isDeepClue ? isScale ? 'show' : 'hide' : ''">
                <view class="newClue-title hyshtj">
                    {{ isDeepClue ? " 获得一条深入线索" : " 获得一条新线索" }}
                </view>
                <img class="newClue-img" :style="{ opacity: isDeepClue ? '0' : '1' }" :src="newClueSrc" alt=""
                    mode="aspectFit">
                <view style="">这里看起来似乎有些不同寻常</view>
                <view class="theme-button2 button" @tap="isNewClueShow = false; updateClues()">
                    <view class="theme-button-clear"></view>
                    <view class="newClue-btn-text hyshtj">收入线索集</view>
                </view>
            </view>
        </view>
        <fourInOne v-if="isFourInOneShow" />
        <dmDialog v-if="memberStore.info" :dialogObj="dialogObj" @cancel="closeDialog" @confirm="confirm"
            @page="pageJump" :userInfo="userInfo" />
        <jump
            v-if="memberStore.info && memberStore.info.flow[0].status !== 1 && memberStore.roomId !== '' && currentPage !== 'RoomNumber'"
            :hide-index="currentPage" @page="pageJump" :flow="flow" :userInfo="userInfo" />

        <RoomNumber v-show="currentPage === 'RoomNumber'" :dialog-obj="dialogObj" @updateDialogObj="updateDialogObj"
            @page="pageJump" />
        <TeamInfo v-if="memberStore.info && memberStore.virtualRoleId" v-show="currentPage === 'TeamInfo'" :dialog-obj="dialogObj"
            :teamInfo="teamInfo" :userInfo="userInfo" @updateDialogObj="updateDialogObj" />
        <ZfMap v-if="memberStore.info && memberStore.virtualRoleId" v-show="currentPage === 'ZfMap'" :dialog-obj="dialogObj" @page="pageJump"
            @updateDialogObj="updateDialogObj" :currentPage="currentPage" :flow="flow" :userInfo="userInfo" />
        <Gualing v-if="memberStore.info" v-show="currentPage === 'Gualing'" :dialog-obj="dialogObj"
            @updateDialogObj="updateDialogObj" />
        <CueSet
            v-if="memberStore.info && memberStore.virtualRoleId && memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues.length!==0"
            v-show="currentPage === 'CueSet'" :dialog-obj="dialogObj" :teamInfo="teamInfo" :newReplay="newReplay"
            :currentPage="currentPage" :userInfo="userInfo" @updateDialogObj="updateDialogObj" />
        <view v-if="isPosterShow" class="poster">
            <!-- <image src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/haibao.png" mode="fill" /> -->
            <!-- <image src="https://img520.com/NWEhqh.jpg" mode="fill" /> -->
            <view class="poster-bg" ref="contentView" id="content-view">
                <view style="position: fixed;top:48.5vh;width: 75%;display: flex;flex-wrap: wrap;margin-left: 12.5%;">
                    <view class="poster-info">{{ userInfo?.user.slice(0, 10) }}</view>
                    <view class="poster-info" style="padding-left: 6.5%;">{{
                        memberStore.info.characters[memberStore.virtualRoleId - 1]?.name }}</view>
                    <view class="poster-info" style="padding-left: 6.5%;">{{ getCurrentFormattedDate() }}</view>
                    <view class="poster-info" style="margin-top: 4.5vh;">{{ memberStore.info.teamInfo.location }}</view>
                    <view class="poster-info" style="margin-top: 4.5vh;padding-left: 6.5%;">{{
                        memberStore.info.teamInfo.dmName }}</view>
                </view>
                <view class="flex-row-center" style="position: fixed;bottom: 6vh;width: 100%;">
                    <view @tap="back" class="hide-btn">返回</view>
                    <view @tap="handleSaveImage()" class="hide-btn">保存</view>
                </view>
            </view>
        </view>
        <canvas style="position: fixed;left: 99999rpx;;width: 1080px;height: 1920px;" type="2d" id="contentCanvas" ></canvas>
    </view>
</template>

<style scoped>
.poster-info {
    width: 33%;
    padding-left: 5%;
    box-sizing: border-box;
    font-size: 23rpx;
    font-weight: 700;
}

.hide-btn {
    height: 6vh;
    background-color: #670100;
    width: 40%;
    opacity: 0;
}

.poster-bg {
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/haibao.png');
    width: 100%;
    height: 100vh;
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
    z-index: 99999;
    background-color: rgba(0, 0, 0, 0.6);
}

.newClue-img {
    opacity: 0;
    width: 455rpx;
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
    transition: all 1s;
    z-index: 1;
    backface-visibility: hidden;
}

.newClue-img-B {
    width: 45rpx;
    position: absolute;
    transition: all 1s;
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

.poster {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    background-color: aliceblue;
}

.poster image {    width: 100%;
    height: 100%;
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