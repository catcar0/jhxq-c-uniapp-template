<script setup lang='ts'>
import { useMainAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";

defineProps<{
	scriptId?: string | number
}>()

const cover: { [name: string]: string } = {
	'dlwh': 'https://applet.cdn.wanjuyuanxian.com/admin/FnJLsIea5I56lwj6Rfg8mqBW1lYZ.png?imageView2/2/w/400',
	'lan': 'https://applet.cdn.wanjuyuanxian.com/lan/cover.jpg?imageView2/2/w/400'
}
const MainAuthStore = useMainAuthStore();
const GameCode = computed(() => MainAuthStore.GameCode || 'dlwh');
const PlayInfo = computed(() => MainAuthStore.PlayInfo);
</script>

<template>
	<view class="start-page">
		<image class="filter-bg" :src="PlayInfo?.script_preview || cover[GameCode]" mode="heightFix"></image>
		<image class="poster" :src="PlayInfo?.script_preview || cover[GameCode]" mode="widthFix"></image>
	</view>
</template>

<style scoped>
.start-page {
	position: fixed;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	height: 100%;
	width: 100%;
}

.filter-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	filter: blur(25px);
	-ms-filter: blur(25px);
	-webkit-filter: blur(25px);
	transform: scale(1.2);
	object-fit: cover;
}

.poster {
	position: relative;
	z-index: 2;
	width: 90%;
	height: 90%;
	border-radius: 32rpx;
	overflow: hidden;
	object-fit: contain;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}
</style>