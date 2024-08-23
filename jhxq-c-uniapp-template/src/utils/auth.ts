const TokenKey = "Authorization";

export const LemToken = {
	get() {
		try {
			return uni.getStorageSync(TokenKey)
		} catch (e: any) {
			throw e
		}
	},
	set(token: string) {
		try {
			uni.setStorageSync(TokenKey, token)
		} catch (e: any) {
			throw e
		}
	},
	clear() {
		try {
			uni.removeStorageSync(TokenKey)
		} catch (e) {
			throw e
		}
	},
};

export const WxLocalInfos = {
	get(type: 'nickname' | 'avatar') {
		try {
			return uni.getStorageSync('wx_' + type)
		} catch (e: any) {
			throw e
		}
	},
	set(type: 'nickname' | 'avatar', value: string) {
		try {
			uni.setStorageSync('wx_' + type, value)
		} catch (e: any) {
			console.log(e)
			throw e
		}
	},
	clear(type?: 'nickname' | 'avatar') {
		try {
			if (type) {
				uni.removeStorageSync('wx_' + type)
			} else {
				uni.removeStorageSync('wx_nickname');
				uni.removeStorageSync('wx_avatar');
			}
		} catch (e) {
			// error
			throw e
		}
	},
}

