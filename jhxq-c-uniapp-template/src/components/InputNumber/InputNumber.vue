<template>
	<view class="input-number" :class="{'disable':disable}">
		<view @click="handleButton('remove')" class="button remove">
			<text>-</text>
		</view>
		<input @input="handleInput" :disabled="disableInput" type="number" :value="modelValue" maxlength="4"/>
		<view @click="handleButton('add')" class="button add" :class="{'disable':disableAdd}">
			<text>+</text>
		</view>
	</view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	modelValue:number
	disable?:boolean
	disableAdd?:boolean
	disableInput?:boolean
}>(),{
	disable:false,
	disableAdd:false,
	disableInput:false
});
const emit = defineEmits<{
	update:[payload:any]
}>()
const handleButton = (type:string) => {
	if(type == 'add'){
		if(props.disableAdd) return;
		update(props.modelValue + 1)
	}else{
		update(props.modelValue - 1)
	}
}
const handleInput = (e:any) => {
	update(e.target.value);
}
const update = (value:number) => {
	if(value && value <= 0){
		emit('update:modelValue',0);
		emit('update')
	}else{
		emit('update:modelValue',Number(value || 0));
		emit('update');
	}
}
</script>

<style scoped>
.input-number{
	display: flex;
	align-items: center;
	gap: 8rpx;
	height: 60rpx;
}

.input-number>input{
	color: #93371A;
	box-shadow: inset -2px 2px 1px 0px rgba(147, 55, 26, 0.3);
	border-radius: 20rpx;
	border: 2px solid #DFC3BB;
	font-weight: bold;
	font-size: 30rpx;
}

.disable{
	opacity: 0.6;
	pointer-events: none;
}

.button{
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #FEE24B;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 50rpx;
	line-height: 30rpx;
	font-weight: 400;
	border-radius: 16rpx;
	box-shadow: inset -2px -2px 1px 0px rgba(147, 55, 26, 0.3);
}
.button>text{
	height: 20px;
	line-height: 16px;
}
.button:active{
	transform: scale(0.9);
}
.button.remove{
	/* border-radius: 4px 0 0 4px; */
}
.button.add{
	/* border-radius:0 4px 4px 0; */
}

.input-number>input{
	width: 160rpx;
	text-align: center;
	height: 100%;
	background-color: #F3F3F3;
	min-width: 160rpx;
}
</style>