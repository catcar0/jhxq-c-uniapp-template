<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();
const props = defineProps<{ hideIndex: string, flow: any, userInfo: any,otherClick:number }>()

const isSpecificFlowActive = computed(() => {
    return memberStore.info?.flow[memberStore.info.teamInfo.flowIndex].inner.some((item: { title: string,status:number }) => {
        return (
            // (item.title === '开启逐风' && item.status === 3) ||
            (
                (item.title === '找尸体' ||
                item.title === '音频搜证' ||
                item.title === '地图搜证' || item.title === '卦灵') &&
                item.status === 2
            )
        );
    });
});
const emit = defineEmits(["page"]);
const pages = computed(() => {
    return [
        {
            name: props.flow.inner.find((item: { title: string; }) => item.title === '开启逐风').status === 0 ? '???' : props.flow.inner.find((item: { title: string; }) => item.title === '卦灵').status === 0 ? '逐风' : '卦灵',
            url: props.flow.inner.find((item: { title: string; }) => item.title === '卦灵').status === 0 ? 'ZfMap' : 'Gualing',
            status: props.flow.inner.find((item: { title: string; }) => item.title === '开启逐风').status === 0 ? '0' : '1',
        },
        {
            name: "线索集",
            url: 'CueSet',
            status: props.userInfo.cueset.clues.length === 0 ? '0' : '1',
        },
        {
            name: "业绩表",
            url: 'TeamInfo',
            status: '1',
        }
    ];
});
const canJump = ref([false, false, false])
const flowIndex = computed(() => {
    console.log(memberStore.info.teamInfo.flowIndex, 'flowindex');
    return memberStore.info.teamInfo.flowIndex;
});
watch(() => flowIndex, (a, b) => {
    emit('page', 'TeamInfo');
},
    { deep: true })
const jump = (url: string, status: string, index: number) => {
    if (!canJump.value[index]) {
        canJump.value = [true, true, true];
        return
    }
    if (status === '0') return
    emit('page', url);
    canJump.value = [false, false, false]
}
const hasUnreadClues = computed(() => {
    const clues = memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.clues;

    // 检查是否存在未读的线索
    return clues.some(clue => clue.isRead === false);
});
    watch(() => props.otherClick, (a, b) => {
      canJump.value = [false, false, false];
    });
</script>

<template>
    <view class="jump-box hyshtj" >
        <view v-show="hideIndex !== item.url" @tap.stop="jump(item.url, item.status, index)" v-for="(item, index) in pages"
            :key="index" class="paper flex-row-center "
            :class="[item.status === '0' ? 'hide' : '', canJump[index] ? 'expand' : '']">
            <text class="font-player-gradient1">{{ item.name }}</text>
            <view v-if="hasUnreadClues && item.name === '线索集'" class="redPoint"></view>
            <view v-if="isSpecificFlowActive && (item.name === '逐风' || item.name === '卦灵')"
                class="redPoint"></view>
        </view>
    </view>
</template>

<style scoped>
.redPoint {
    width: 20rpx;
    height: 20rpx;
    border-radius: 999rpx;
    background-color: red;
    position: absolute;
    margin-left: 150rpx;
    margin-top: -90rpx;
}

.expand {
    margin-left: 70rpx;
}

.hide {
    filter: brightness(50%);
}

.jump-box {
    position: fixed;
    z-index: 13000;
    left: -140rpx;
    bottom: 85rpx;
    transform: rotate(-0deg);

}

.paper {
    margin-top: -20rpx;
    width: 220rpx;
    height: 120rpx;
    background-color: aliceblue;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/paper2.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    padding-left: 50rpx;
    box-sizing: border-box;
    font-size: 38rpx;
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