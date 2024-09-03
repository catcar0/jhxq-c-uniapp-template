import { useMemberStore } from "@/package_nzgx/stores"
import { useMainAuthStore } from "@/stores/auth";

const Api_Url = 'https://nzgx.api.wanjuyuanxian.com';
const TEST_Api_Url = 'https://mn.nzgx.api.wanjuyuanxian.com';

const httpInterceptor = {
    invoke(options: UniApp.RequestOptions) {
        const IsTestPlay = useMainAuthStore().IsTestPlay;

        if (!options.url.startsWith('http')) {
            options.url = (IsTestPlay ? TEST_Api_Url : Api_Url) + options.url
        }
        options.timeout = 10000

        options.header = {
            ...options.header,
            // 'source-client': 'miniapp'
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        const memberStore = useMemberStore()
        const token = memberStore.profile?.token
        if (token) {
            options.header.Authorization = "Bearer " + token
        }
    }
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

interface Data<T> {
    code: string
    msg: string
    result: T
}


const http = <T>(options: UniApp.RequestOptions) => {
    return new Promise<Data<T>>((resolve, reject) => {
        uni.request({
            ...options,
            success(res) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data as Data<T>)
                } else if (res.statusCode === 401) {
                    const memberStore = useMemberStore()
                    memberStore.clearProfile()
                    // uni.navigateTo({ url: '/package_nzgx/pages/index/index' })
                    reject(res)
                } else {
                    uni.showToast({
                        icon: 'none',
                        title: ((res.data as Data<T>).msg || '请求错误')
                    })
                    reject(res)
                }
            },

            fail(err) {
                uni.showToast({
                    icon: 'none',
                    title: '网络错误，换个网络试试'
                })
                reject(err)
            }
        })
    })
}

export { http }