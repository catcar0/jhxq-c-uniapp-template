// 小程序自动更新
export const WxAutoUpdate = () => {
	if(uni.canIUse('getUpdateManager')){
		console.log('支持小程序自动更新')
		const updateManager = uni.getUpdateManager();
		updateManager.onCheckForUpdate(function (res) {
		  // 请求完新版本信息的回调
		  console.log('小程序是否有更新：',res.hasUpdate); // 是否有更新
		});
		updateManager.onUpdateReady(function (res) {
		  uni.showModal({
		    title: '更新提示',
		    content: '新版本已经准备好，请先重启应用？',
		    success(res) {
		      if (res.confirm) {
		        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
		        updateManager.applyUpdate();
		      }
		    }
		  });
		});
		updateManager.onUpdateFailed(function (err) {
		  // 新的版本下载失败
		  console.log('小程序新的版本下载失败');
		  console.log(err);
		});
	}else{
		console.log('不支持小程序更新');
	}
}
