<template>
	<view class="water-mask" v-if="IsTestPlay">
		<block v-for="i in 8" :key="i">
			<view class="water-mask-text" :style="{'margin-left': (i%2==0?100:-100)+'rpx'}">
				<text v-for="t in 4">{{'剧环星球 模拟开本'}}</text>
			</view>
		</block>
	</view>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import { useMainAuthStore } from '@/stores/auth';

	const AuthStore = useMainAuthStore();
	const IsTestPlay = computed(() => AuthStore.IsTestPlay);
</script>

<style scoped>
	.water-mask {
		position: fixed;
		top: -10vh;
		left: -50vw;
		width: 250vw;
		height: 100vh;
		z-index: 999;
		pointer-events: none;
		transform: rotate(-45deg);
		opacity: 0.4;
		color: gray;
	}

	.water-mask-text {
		display: flex;
		gap: 200rpx;
		margin: 50rpx;
		padding: 50rpx;
		width: 100%;
	}
</style>