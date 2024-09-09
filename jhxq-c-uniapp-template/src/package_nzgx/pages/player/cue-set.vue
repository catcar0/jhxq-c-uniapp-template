<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import audioplay from '@/package_nzgx/pages/player/components/audioplay.vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
import { allClues } from '@/package_nzgx/services/clues';
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();
const setClass = ['物品', '音频', '记录']
const classIndex = ref(0)
const cluesIndex = ref(-1)
const props = defineProps({
    dialogObj: Object,
    userInfo: Object,
    teamInfo: Object,
    currentPage: String,
    newReplay: Number
});
const durationList = {
    clue19: { duration: 15 },
    clue20: { duration: 13 },
    clue38: { duration: 24 },
    clue39: { duration: 8 },
    clue40: { duration: 10 },
    clue41: { duration: 12 },
}
// const audio = { name: 'clue19' }
const audioList = ref([
    // {
    //     roles: allClues[audio.name].name,
    //     location: allClues[audio.name].content1,
    //     content: allClues[audio.name].content2,
    //     src: allClues[audio.name].url + '.mp3',
    //     isPlaying: false,
    //     isRead: audio.isRead,
    //     context: null,
    //     duration: durationList[audio.name].duration,
    //     scrollText: allClues[audio.name].content2,
    //     scrollPosition: 0,
    //     scrollOffset: 0,
    //     scrollAnimationFrame: 0,
    // }
])
    watch(
        () => memberStore.info?.characters?.[memberStore.virtualRoleId - 1]?.cueset?.audio || [],
        (newAudioList) => {
            if (newAudioList.length === 0) return;
            
            const characterAudioList = newAudioList.map(audio => ({
                roles: allClues[audio.name]?.name,
                location: allClues[audio.name]?.content1,
                content: allClues[audio.name]?.content2,
                src: allClues[audio.name]?.url + '.mp3',
                isPlaying: false,
                isRead: audio.isRead,
                context: null,
                duration: durationList[audio.name]?.duration,
                scrollText: allClues[audio.name]?.content2,
                scrollPosition: 0,
                scrollOffset: 0,
                scrollAnimationFrame: 0,
            }));

            audioList.value = characterAudioList;
        },
        { deep: true }
    );

const replayIndex = ref(-1)

const sortedClues = ref();
watch(() => props.currentPage, (a, b) => {
    if (a === 'CueSet') sortClues()
},
    { deep: true })
watch(() => props.newReplay, (a, b) => {
    classIndex.value = 2
},
    { deep: true })
const sortClues = () => {
    console.log('排序')
    if (!memberStore.info) return
    let clues = memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues;
    if (clues.length === 0) return
    // 去掉 name 相同的重复线索，保留第一个出现的
    console.log(clues.length)
    clues = clues.filter((clue, index, self) =>
        index === self.findIndex((c) => c.name === clue.name)
    );

    // 创建新数组并排序
    sortedClues.value = [...clues].sort((a, b) => {
        // 先按照是否已读排序，未读的排在前面
        if (a.isRead === b.isRead) {
            // 如果 isRead 相同，则按时间戳排序，时间戳大的（新的）排在前面
            return b.timestamp - a.timestamp;
        } else if (a.isRead === false && b.isRead === true) {
            return -1; // a 排在 b 之前
        } else {
            return 1; // b 排在 a 之前
        }
    });

    // 更新排序后的线索列表
    memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues = sortedClues.value;
};


const updateInfo = (info: any) => {
    webSocketStore.gameSend(
        info
    )
}
const readClue = (name: string) => {

    console.log(name, memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues.find(clue => clue.name === name))
    memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues.find(clue => clue.name === name).isRead = true;


};
const firstClue = (index: number, name: string) => {
    readClue(name)
    cluesIndex.value === index ? cluesIndex.value = -1 : cluesIndex.value = index;
    updateInfo(memberStore.info)
}

const preview = (url: string) => {
    uni.previewImage({
        urls: [url],
        current: 0
    });
}
const readReplay = (index: number) => {
    memberStore.info.teamInfo.replay[index].userRead[memberStore.virtualRoleId - 1] = 1
    updateInfo(memberStore.info)
}
const haveNotReadClue = computed(() => {
    if (memberStore.info && memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues && memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues.length !== 0) {
        return memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues.filter(clue => clue.isRead === false).length
    } else return 0
})
const haveNotReadAudio = computed(() => {
    if (memberStore.info && memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.audio && memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.audio.length !== 0) {
        return memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.audio.filter(audio => audio.isRead === false).length
    } else return 0
})
const haveNotReadReplay = computed(() => {
    if (memberStore.info && memberStore.info.teamInfo.replay) {
        return memberStore.info.teamInfo.replay.filter(replay => replay.userRead[memberStore.virtualRoleId - 1] === 0 && (replay.hy.length !== 0 || replay.xa.length !== 0)).length
    } else return 0
})
const allHaveNotRead = computed(() => {
    return [haveNotReadClue, haveNotReadAudio, haveNotReadReplay]
})
</script>

<template>
    <view class="cue-set">
        <view class="set-class flex-row-sb" style="z-index: 9999;">
            <view @tap="classIndex = index" v-for="(item, index) in setClass" :key="item"
                style="width: 150rpx;height: 100rpx;">

            </view>
        </view>
        <view class="set-class flex-row-sb">
            <view @tap="classIndex = index" v-for="(item, index) in setClass" :key="item" class="flex-row-center"
                :class="index === classIndex ? 'class-selected' : 'class-not-selected'">
                <text class="class-name">{{ item }}</text>
                <view v-show="allHaveNotRead[index].value !== 0"
                    style="width: 20rpx;height: 20rpx;border-radius: 999rpx;background-color: red;position: absolute;margin-left: 145rpx;margin-top: -85rpx;">
                </view>
            </view>
        </view>
        <view class="paper">
            <view v-show="classIndex !== 0" class="make-old"></view>
            <!-- 物品 -->
            <view class="class-inner" v-show="classIndex === 0">
                <view class="player-title hyshtj ">
                    <view class="font-player-gradient1">线索集</view>
                </view>
                <view v-if="cluesIndex !== -1" class="clue-big-image flex-row-center">
                    <img mode="heightFix"
                        :src="allClues[memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues[cluesIndex].name].url + '.png'"
                        alt=""
                        @tap="preview(allClues[memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues[cluesIndex].name].url + '.png')">
                </view>
                <scroll-view scroll-y :style="{ height: cluesIndex === -1 ? '0vh' : '7vh' }">
                    <view
                        v-if="cluesIndex !== -1 && memberStore.info && allClues[memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues[cluesIndex].name].url"
                        class="flex-row-center clue-text">
                        {{ allClues[memberStore.info.characters[memberStore.virtualRoleId -
                            1].cueset.clues[cluesIndex].name].content2 }}
                        <!-- {{ allClues[memberStore.info.characters[memberStore.virtualRoleId -
                                1].cueset.clues[cluesIndex].name].name }} -->
                    </view>
                </scroll-view>
                <scroll-view scroll-y :style="{ maxHeight: cluesIndex === -1 ? '71vh' : '29vh' }">
                    <view class="clues-box flex-row-center" v-if="memberStore.info">
                        <!-- <view class="make-old2"></view> -->
                        <view
                            v-for="(item, index) in memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues"
                            :key="index">
                            <view @tap="firstClue(index, item.name);" class="clues-item"
                                :class="cluesIndex === index ? 'clue-selected-border1' : ''">
                                <view v-if="!item.isRead"
                                    style="width: 20rpx;height: 20rpx;border-radius: 999rpx;background-color: red;position: absolute;margin-left: 100rpx;margin-top: -5rpx;">
                                </view>
                                <img class="clue-selected-border2" v-show="cluesIndex === index"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/cue_seleted.png" alt="">
                                <view class="clue-small-image"
                                    :style="{ backgroundImage: `url(https://applet.cdn.wanjuyuanxian.com/nzgx/static/clues/${item.name}.png)` }">
                                    <!-- <img class="clue-small-image"  :src="`https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/${item}.png`" alt=""> -->
                                </view>
                            </view>
                            <view v-if="allClues[item.name]" class="clue-name"><text>{{ allClues[item.name].name
                                    }}</text></view>
                        </view>
                    </view>
                </scroll-view>

            </view>
            <!-- 音频 -->
            <view class="class-inner" v-show="classIndex === 1">
                <view class="player-title hyshtj ">
                    <view class="font-player-gradient1">调查记录</view>
                </view>
                <scroll-view scroll-y style="width: 625rpx;height: 71vh;padding-top: 20rpx;">
                    <audioplay class="a" :audioList="audioList" :isDialog="false" />
                </scroll-view>
                <!-- <view class="audio-box flex-row-sb" v-for="(item, index) in audioList" :key="index">
                </view> -->
            </view>
            <!-- 记录 -->
            <view class="class-inner" v-show="classIndex === 2">
                <view class="player-title hyshtj ">
                    <view class="font-player-gradient1">调查记录</view>
                </view>
                <scroll-view scroll-y style="width: 625rpx;height: 71vh;padding-top: 20rpx;">
                    <view v-if="replayIndex === -1" v-show="item.hy.length !== 0 || item.xa.length !== 0"
                        class="audio-box flex-row-sb" @tap="replayIndex = index; readReplay(index)"
                        v-for="(item, index) in memberStore.info?.teamInfo.replay" :key="index">
                        <view class="flex-row-sb" style="width: 100%;">
                            <view>{{ item.name }}</view>
                            <view style="font-size: 34rpx;font-weight: 700;" class="font-player-gradient1">
                                <text
                                    v-show="item.userRead[memberStore.virtualRoleId - 1] === 0 && item.xa.length !== 0">有更新</text>
                            </view>
                        </view>
                    </view>
                    <view v-if="replayIndex !== -1"
                        style="display: flex;flex-direction: column;justify-content: space-between;">
                        <view style="display: flex;height: 50%;">
                            <view style="max-height: 70vh;width: 100rpx;" class="flex-row-center">
                                <img style="height: 100rpx;width: 50rpx;" @tap="replayIndex--; readReplay(replayIndex)"
                                    v-show="replayIndex !== 0 && memberStore.info?.teamInfo.replay.length > 1"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/left.png" alt="">
                            </view>
                            <view>
                                <view style="font-weight: 700;height: 100rpx;text-align: center;padding-top: 30rpx;">{{
                                    memberStore.info?.teamInfo.replay[replayIndex].name }}</view>
                                <view v-for="(item, index) in memberStore.info?.teamInfo.replay[replayIndex].hy"
                                    v-if="memberStore.info?.teamInfo.replay[replayIndex].hy.length !== 0"
                                    style="display: flex;margin-top: 30rpx;gap: 20rpx;font-weight: 700;font-size: 25rpx;">
                                    <view>{{ item.charAt(0) }}.</view>
                                    <view>{{ item.slice(1) }}</view>
                                </view>
                                <view v-for="(item, index) in memberStore.info?.teamInfo.replay[replayIndex].xa"
                                    v-if="memberStore.info?.teamInfo.replay[replayIndex].xa.length !== 0"
                                    style="display: flex;margin-top: 30rpx;gap: 20rpx;font-weight: 700;font-size: 25rpx;">
                                    <view>{{ item.charAt(0) }}.</view>
                                    <view>{{ item.slice(1) }}</view>
                                </view>
                            </view>
                            <view style="max-height: 70vh;width: 100rpx;" class="flex-row-center">
                                <img v-if="replayIndex !== memberStore.info?.teamInfo.replay.length - 1 && memberStore.info?.teamInfo.replay.length > 1 && memberStore.info?.teamInfo.replay[replayIndex + 1].hy && memberStore.info?.teamInfo.replay[replayIndex + 1].hy.length !== 0"
                                    style="height: 80rpx;width: 50rpx;transform: rotate(180deg);"
                                    @tap="replayIndex++; readReplay(replayIndex)"
                                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/left.png" alt="">
                            </view>
                        </view>
                        <view @tap="replayIndex = -1" class="theme-button button">返回
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<style scoped>
.theme-button {

    margin-left: 190rpx;
    margin-top: 40rpx;
    width: 245rpx;
    line-height: 94.5rpx;
    font-size: 28rpx;
    border-radius: 16px;
    font-weight: bold;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_btn1.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.clue-name {
    padding-top: 15rpx;
    text-align: center;
    width: 120rpx;
    height: 30rpx;
}

.a {
    pointer-events: all;
}

.make-old {
    margin-top: 120rpx;
    margin-left: 40rpx;
    transform: rotate(2deg);
    width: 80%;
    height: 83%;
    position: absolute;
    z-index: 11;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/make_old3.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    mix-blend-mode: soft-light;
    opacity: 0.8;
    pointer-events: none;
}

.make-old2 {
    width: 80%;
    height: 83%;
    position: absolute;
    z-index: 9999;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/make_old3.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    mix-blend-mode: soft-light;
    opacity: 0.8;
    pointer-events: none;
}

.cue-set {
    overflow: hidden;
    color: #333333;
    width: 100%;
    height: 100vh;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/cue_set_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.set-class {
    pointer-events: all;
    color: black;
    position: fixed;
    width: 80%;
    right: 20rpx;
    top: 90rpx;
    transform: rotate(1deg);
}

.class-name {
    margin-top: -20rpx;
    transform: rotate(2deg);
    font-weight: 700;
    font-size: 30rpx;
}

.class-selected {
    width: 158rpx;
    height: 105rpx;
    margin-top: -40rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/set_selected.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    transform: rotate(-2deg);
}

.class-not-selected {
    width: 158rpx;
    height: 105rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/set_not_selected.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    transform: rotate(-2deg);
}

.paper {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    padding: 0 170rpx 0rpx 50rpx;
    box-sizing: border-box;
    position: absolute;
    left: -30rpx;
    top: 125rpx;
    width: 120%;
    height: 87%;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/paper.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.class-inner {
    transform: rotate(2deg);
    padding-left: 80rpx;
    padding-top: 50rpx;
}

.class-title {
    width: auto;
    height: 70rpx;
    margin-left: -40rpx;
    padding-left: 60rpx;
    font-size: 45.5rpx;
    display: flex;
    align-items: center;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/teaminfo_title_bg.png') no-repeat;
    background-size: 175rpx 70rpx;
    background-position: left;
}

.clue-big-image {
    /* margin-left: 100rpx; */
    margin-top: 20rpx;
    height: 500rpx;
    /* 固定高度 */
    width: 100%;
    /* 占据父容器的宽度 */
}

.clues-item {
    width: 112rpx;
    height: 112rpx;
    background-color: #CAA16A;
    text-align: center;
    mix-blend-mode: multiply;
}

.clue-small-image {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    /* object-fit:contain; */
}

.clue-selected-border1 {
    box-sizing: border-box;
    border: 4rpx solid #583400;
}

.clue-selected-border2 {
    position: absolute;
    margin-left: -62rpx;
    margin-top: -8rpx;
    width: 122rpx;
    height: 122rpx;
    transform: rotate(-2deg);
}

.clue-text {
    width: 90%;
    font-size: 24rpx;
    font-weight: 600;
    height: 100rpx;
    line-height: 150%;
    text-align: center;
    margin-top: 0rpx;
    padding-top: 10rpx;
}

.clues-box {
    margin-left: -20rpx;
    width: 645rpx;
    justify-content: flex-start;
    padding-left: 50rpx;
    /* min-height: 303rpx; */
    /* height: 303rpx; */
    font-size: 20rpx;
    font-weight: 600;
    margin-top: 20rpx;
    padding-top: 40rpx;
    padding-bottom: 20rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 30rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/paper6.jpg') repeat;
    background-size: 100% 100%;
}

.audio-box {
    background-color: #D3B58B;
    height: 121rpx;
    width: 625rpx;
    margin-bottom: 20rpx;
    padding: 20rpx;
    box-sizing: border-box;
}

.audio-icon1 {
    width: 85rpx;
    height: 85rpx;
    background-color: #A66C2C;
    border-radius: 999rpx;
}

.audio-icon1-img {
    width: 30rpx;
    height: 30rpx;
    margin-left: 2rpx;
    transform: rotate(2deg);
}

.audio-icon2 {
    width: 315rpx;
    height: 85rpx;
    transform: rotate(-2deg);
    filter: brightness(0.9);
}

.audio-roles {
    font-size: 24.5rpx;
}

.audio-location {
    font-size: 21rpx;
}

.audio-content {
    width: 315rpx;
    line-height: 85rpx;
    overflow: hidden;
    white-space: nowrap;
    /* display: flex;
    align-items: center; */
}

.audio-info {
    height: 85rpx;
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