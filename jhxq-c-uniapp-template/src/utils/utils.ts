export type Word = "A"|"B"|"C"|"D"|"E"|"F";

export const Number2Word: { [id: number]: Word } = {
	0: "A",
	1: "B",
	2: "C",
	3: "D",
	4: "E",
	5: "F",
}

// 隐藏微信小程序HOME返回
export const WxHideHomeButton = () => {
	// #ifdef MP-WEIXIN
	if (wx.hideHomeButton) {
		wx.hideHomeButton();
	}
	// #endif
}

// 获取微信环境
export const GetWxEnv = (): "develop" | "trial" | "release" => {
	// #ifdef MP-WEIXIN
	let AccountInfo = wx.getAccountInfoSync();
	// console.log(AccountInfo)
	return AccountInfo.miniProgram.envVersion;
	// #endif
}

// 防抖函数
type DebounceOptions = {
	leading?: boolean; // 是否在触发时立即执行一次
	trailing?: boolean; // 是否在最后一次调用后延迟一段时间执行
};
export const Debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number,
	options: DebounceOptions = {}
) => {
	let timeout: NodeJS.Timeout | null;
	let lastArgs: any[];
	let lastThis: any;
	let result: any;

	const { leading = false, trailing = true } = options;

	const execute = () => {
		result = func.apply(lastThis, lastArgs);
		timeout = null;
	};

	const debounced = function (this: any, ...args: Parameters<T>) {
		lastArgs = args;
		lastThis = this;

		if (timeout) {
			clearTimeout(timeout);
		}

		if (leading && !timeout) {
			result = func.apply(this, args);
		}

		timeout = setTimeout(() => {
			if (trailing) {
				execute();
			}
		}, wait);

		if (!timeout && trailing) {
			result = func.apply(this, args);
		}

		return result;
	};

	debounced.cancel = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
}

export function Throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
	let inThrottle: boolean;
	let lastFunc: any;
	let lastRan: any;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | void {
		const context = this;
		if (!inThrottle) {
			func.apply(context, args);
			lastRan = Date.now();
			inThrottle = true;
		} else {
			clearTimeout(lastFunc);
			lastFunc = setTimeout(function () {
				if (Date.now() - lastRan >= limit) {
					func.apply(context, args);
					lastRan = Date.now();
				}
			}, Math.max(limit - (Date.now() - lastRan), 0));
		}
	} as T;
}


// 是否为开发环境
export const IsDev = (): boolean => {
	if (process.env.NODE_ENV === 'development') {
		return true
	} else {
		return false
	}
}

// 七牛图像压缩
export const QiniuImageZip = (src: string, q: number = 50, w: number = 250, h: number = 250) => {
	return src + `?imageView2/1/format/webp/q/${q}/w/${w}/h/${h}`
}

// 获取地址参数
export const GetFromUrl = (originUrl: string, paramName: string) => {
	const match = originUrl.match(new RegExp(`[?&]${paramName}=([^&]+)`));
	const decodedData = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	return decodedData || null;
};

// 格式化时间
export function FormatMessageTime(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp * 1000;

	// 超过一天，返回具体时间
	if (diff >= 24 * 60 * 60 * 1000) {
		const date = new Date(timestamp);
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	// 小于一天，但超过一小时，返回几小时前
	if (diff >= 60 * 60 * 1000) {
		const hoursAgo = Math.floor(diff / (60 * 60 * 1000));
		return `${hoursAgo}小时前`;
	}

	// 小于一小时，但超过一分钟，返回几分钟前
	if (diff >= 60 * 1000) {
		const minutesAgo = Math.floor(diff / (60 * 1000));
		return `${minutesAgo}分钟前`;
	}

	// 小于一分钟，返回刚刚
	return '刚刚';
}
