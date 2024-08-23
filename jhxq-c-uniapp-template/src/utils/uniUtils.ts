import { onShareAppMessage } from "@dcloudio/uni-app";

// 防止弹窗后背景滚动
export const setPageOverflow = (overflow: 'hidden' | 'auto') => {
	wx.setPageStyle({
		style: {
			overflow: overflow
		}
	})
}

// 弹窗
export const Toast = (title: string) => {
	uni.showToast({
		icon: "none",
		title
	})
}


// 分享
export const InitShare = () => {
	return onShareAppMessage(() => {
		return {
			title: "《顶流网红》火热申领中！",
			path: "/pages/shop/shop",
		}
	})
}

export const DownloadFile = (path: string, type: 'photo' | 'video' | 'file') => {
	console.log(path)
	return new Promise((resolve, reject) => {
		uni.downloadFile({
			url: path,
			success: async (res) => {
				if (res.statusCode == 200) {
					let tempFilePath = res.tempFilePath;
					try {
						if (type == 'photo' || type == 'video') {
							await saveToAlbum(tempFilePath, type)
						} else {
							await saveFile(tempFilePath)
						}
						resolve(true);
					} catch (err: any) {
						uni.showModal({
							content: JSON.stringify(err)
						})
						reject(err)
					}

				} else {
					reject();
				}
			}, fail: (err) => {
				uni.showModal({
					content: JSON.stringify(err)
				})
				reject(err);
			}
		})
	})
}

// 保存其他文件
export const saveFile = (path: string) => {
	return new Promise((resolve, reject) => {
		uni.getFileSystemManager().saveFile({
			tempFilePath: path,
			filePath: path,
			success: (res) => {
				resolve(res);
			}, fail: (err) => {
				uni.showModal({
					content: JSON.stringify(err)
				})
				reject(err);
			}
		})
	})
}

// 保存进相册
export const saveToAlbum = (path: string, type: 'video' | 'photo') => {
	return new Promise((resolve, reject) => {
		uni.authorize({
			scope: 'scope.writePhotosAlbum',
			success: async () => {
				try {
					if (type == 'photo') {
						await savePhoto(path)
					} else if (type == 'video') {
						await saveVideo(path)
					}
					resolve(true)
				} catch (err: any) {
					reject(err)
				}
			}, fail: async () => {
				uni.showModal({
					title: "提示",
					content: "请先同意相册权限后保存",
					confirmText: "知道了",
					success: (e) => {
						if (e.confirm) {
							uni.openSetting({
								success(res) {
									if (res.authSetting['scope.writePhotosAlbum']) {
										saveToAlbum(path, type);
									}
								}
							})
						}
					}
				})
			}
		})
	})
}

// 保存图片
export const savePhoto = (path: string) => {
	return new Promise((resolve, reject) => {
		uni.saveImageToPhotosAlbum({
			filePath: path,
			success: function (res) {
				resolve(res);
			},
			fail: (err) => {
				reject(err)
			}
		});
	})
}

// 保存视频
export const saveVideo = (path: string) => {
	return new Promise((resolve, reject) => {
		uni.saveVideoToPhotosAlbum({
			filePath: path,
			success: function (res) {
				resolve(res);
			},
			fail: (err) => {
				reject(err)
			}
		});
	})
}