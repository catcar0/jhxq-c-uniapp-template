<template>
	<view class="modal-mask" @click="close" :class="{'show':show}">
		<view @click.stop class="modal-container">
			<view class="modal-header">
				<text class="title">{{title || '通知'}}</text>
			</view>
			<view class="modal-body">
				<slot name="default"></slot>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{
		maskClose: boolean
		title : string
		show : boolean
	}>(),{
		maskClose:true
	})
	const emit = defineEmits(['update:show']);

	const close = () => {
		if(props.maskClose){
			emit('update:show', false);
		}
	}
</script>

<style scoped>
	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 99;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.2);
		opacity: 0;
		transition: .3s ease;
		transition-property: opacity;
		pointer-events: none;
	}

	.modal-mask.show {
		opacity: 1;
		pointer-events: unset;
	}

	.modal-mask.show>.modal-container {
		transform: translate3d(0, 0, 0);
	}

	.modal-container {
		width: 100%;
		max-width: 90%;
		background-color: #eee;
		border: 3px solid #FFFBF1;
		border-radius: 32rpx;
		box-sizing: border-box;
		padding: 10rpx;
		box-shadow: 0px 4px 20px 0px rgba(0,0,0, 0.3);
		transform: translate3d(0, 30rpx, 0);
		transition: .3s ease;
		transition-property: transform;
	}

	.title {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #000;
		padding-bottom: 10rpx;
	}

	.modal-body {
		background: #FFFBF1;
		padding: 16rpx 20rpx;
		border-radius: 20rpx;
		box-sizing: border-box;
	}
</style>