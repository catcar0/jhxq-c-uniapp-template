<script setup lang='ts'>
import { onShow } from '@dcloudio/uni-app';
import { defineProps, onBeforeUnmount, onMounted, watch } from 'vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();

const props = defineProps<{ audioList: AudioItem[], isDialog: boolean }>();

const updatePlayingState = (index: number, isPlaying: boolean) => {
    if (props.audioList[index]) {
        props.audioList[index].isPlaying = isPlaying;
    }
};

const updateScrollPosition = (index: number) => {
    const audio = props.audioList[index];
    if (audio.context) {
        console.log(audio.context)
        const duration = audio.duration; // 获取音频总时长
        const currentTime = audio.context.currentTime; // 获取当前播放时间
        audio.scrollPosition = (currentTime / duration) * 100;

        // 计算滚动偏移量
        const containerWidth = 315; // 假设 audio-content 宽度为 315px
        const textWidth = audio.scrollText.length * 10; // 字幕文本的宽度估计
        const totalScrollDistance = textWidth + containerWidth; // 总滚动距离

        // 根据播放进度动态设置滚动偏移量
        audio.scrollOffset = (currentTime / duration) * totalScrollDistance;
        console.log(`Scroll Offset for index ${index}:`, audio.scrollOffset);
    }
};
const initializeAudioContext = (audio, index) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const context = uni.createInnerAudioContext();
            context.src = audio.src;
            context.onPlay(() => {
                updatePlayingState(index, true);
                startScrollAnimation(index); // 开始滚动动画
            });
            context.onPause(() => {
                updatePlayingState(index, false);
                clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
            });
            context.onStop(() => {
                updatePlayingState(index, false);
                clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
            });
            context.onEnded(() => {
                audio.scrollOffset = 0; // 重置滚动偏移量
                updatePlayingState(index, false);
                clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
            });
            context.onTimeUpdate(() => {
                // updateScrollPosition(index);
            });
            audio.context = context;
            audio.scrollOffset = 0; // 初始化滚动偏移量

            resolve(); // 初始化成功，继续执行
        } catch (error) {
            console.error(`Failed to initialize audio context for index ${index}:`, error);
            reject(error); // 出现错误，拒绝 Promise
        }
    });
};
const togglePlayPause = async (index: number) => {
    console.log('aa')

    const audio = props.audioList[index];
    if (!audio.context) {
        console.error(`Audio context for index ${index} is not initialized.`);
        await Promise.all(props.audioList.map((audio, idx) => {
            if (!audio.context) {
                return initializeAudioContext(audio, idx);
            }
            return Promise.resolve(); // 如果已经初始化，直接跳过
        }));
        // return;
    }

    if (audio.isPlaying) {
        audio.context.pause();
        clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
    } else {
        // 先暂停所有其他音频
        props.audioList.forEach((audioItem, idx) => {
            if (idx !== index && audioItem.isPlaying) {
                audioItem.context?.pause();
                clearTimeout(audioItem.scrollAnimationFrame); // 停止滚动动画
            }
        });
        audio.context.play();
        startScrollAnimation(index); // 开始滚动动画
    }
    if (!audio.isRead) {
        memberStore.info.characters[memberStore.virtualRoleId - 1].cueset.audio[index].isRead = true;
        webSocketStore.gameSend(memberStore.info)
    }
};

const startScrollAnimation = (index: number) => {
    const audio = props.audioList[index];
    const duration = audio.duration; // 音频的总时长
    console.log(duration)
    // 计算滚动所需的每帧步进值，使字幕正好在音频结束时完成滚动
    const containerWidth = 0; // audio-content 的宽度
    const textWidth = audio.scrollText.length * 12; // 字幕的宽度估计
    const totalScrollDistance = textWidth + containerWidth; // 总滚动距离
    const fps = 60; // 每秒 60 帧
    const totalFrames = duration * fps; // 总帧数（音频播放期间）
    const scrollStep = totalScrollDistance / totalFrames; // 每帧的滚动距离

    const step = () => {
        if (audio.isPlaying) {
            audio.scrollOffset += scrollStep; // 每帧移动 scrollStep 的距离
            // console.log(`Animating scroll for index ${index}, offset: ${audio.scrollOffset}`);
            // if (audio.scrollOffset > totalScrollDistance * 2) {
            //     console.log('重置滚动偏移量')
            //     audio.scrollOffset = 0; // 重置滚动偏移量
            // }
            audio.scrollAnimationFrame = setTimeout(step, 1000 / fps); // 模拟 60FPS
        }
    };
    audio.scrollAnimationFrame = setTimeout(step, 1000 / fps); // 开始动画
};
onMounted(() => {
    console.log('mounted')
    props.audioList.forEach((audio, index) => {
        const context = uni.createInnerAudioContext();
        context.src = audio.src;
        context.onPlay(() => {
            updatePlayingState(index, true);
            startScrollAnimation(index); // 开始滚动动画
        });
        context.onPause(() => {
            updatePlayingState(index, false);
            clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
        });
        context.onStop(() => {
            updatePlayingState(index, false);
            clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
        });
        context.onEnded(() => {
            audio.scrollOffset = 0; // 重置滚动偏移量
            updatePlayingState(index, false);
            clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
        });
        context.onTimeUpdate(() => {
            // updateScrollPosition(index);
        });
        audio.context = context;
        audio.scrollOffset = 0; // 初始化滚动偏移量
    });
});
onShow(() => {
    console.log('show')
});
watch(() => props.audioList.length, (newLength, oldLength) => {
    console.log('11');
    if (newLength === oldLength) return
    props.audioList.forEach((audio, index) => {
        const context = uni.createInnerAudioContext();
        context.src = audio.src;
        context.onPlay(() => {
            updatePlayingState(index, true);
            startScrollAnimation(index); // 开始滚动动画
        });
        context.onPause(() => {
            updatePlayingState(index, false);
            clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
        });
        context.onStop(() => {
            updatePlayingState(index, false);
            clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
        });
        context.onEnded(() => {
            audio.scrollOffset = 0; // 重置滚动偏移量
            updatePlayingState(index, false);
            clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
        });
        context.onTimeUpdate(() => {
            // updateScrollPosition(index);
        });
        audio.context = context;
        audio.scrollOffset = 0; // 初始化滚动偏移量
    });
}, { immediate: true }); // 如果需要立即运行一次



onBeforeUnmount(() => {
    props.audioList.forEach(audio => {
        audio.context?.stop();
        clearTimeout(audio.scrollAnimationFrame); // 停止滚动动画
    });
});
</script>


<template>
    <view class="flex-row-sb" :class="isDialog ? 'audio-box2' : 'audio-box'" v-for="(item, index) in audioList"
        :key="index">
        <view class="audio-icon1 flex-row-center" @tap="togglePlayPause(index)">
            <img class="audio-icon1-img"
                :src="`https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/${item.isPlaying ? 'pause' : 'play'}.png`"
                alt="">
        </view>
        <view class="flex-column-sb audio-info">
            <text class="audio-roles">{{ item.roles }}</text>
            <text class="audio-location">{{ item.location }}</text>
        </view>
        <view>
            <view v-show="item.isPlaying" class="audio-content">
                <view :style="{ transform: `translateX(-${item.scrollOffset}rpx)` }"> {{ item.scrollText }} </view>
            </view>
            <img v-show="!item.isPlaying" class="audio-icon2"
                src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/voice_icon.png" alt="">
        </view>
    </view>
</template>

<style scoped>
.audio-box2 {
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/paper3.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    height: 121rpx;
    width: 625rpx;
    transform: scale(0.8);
    /* margin-top: 20rpx; */
    margin-bottom: 20rpx;
    padding: 20rpx;
    box-sizing: border-box;
}

.audio-box {
    background-color: #D3B58B;
    height: 121rpx;
    width: 625rpx;
    /* margin-top: 20rpx; */
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
    font-size: 27rpx;
    color: #8F5843;
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