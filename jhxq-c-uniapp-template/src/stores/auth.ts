import { auth_BindTel, authorizations, getPlayInfos, joinRoom, updatePlayerInfos, type PlayInfos } from "@/services/auth";
import { LemToken } from "@/utils/auth";
import { defineStore } from "pinia";
import { ref } from "vue";

export type GameCodeType = 'lan' | 'dlwh' |'nzgx';

export interface QrParams {
    name: GameCodeType,
    id: string
}


const GamePasswordPath = {
    "dlwh": "/package_dlwh/pages/index/index",
    "lan": "/package_lan/pages/index/index",
    "nzgx": "/package_nzgx/pages/index/index",
}

const GameStartPath = {
    "dlwh": "/package_dlwh/pages/index/index",
    "lan": "/package_lan/pages/wating/index",
    "nzgx": "/package_nzgx/pages/index/index",
}

export const useMainAuthStore = defineStore('auth_main', () => {
    const Token = ref<string>(LemToken.get() || '');
    const IsNeedBindTel = ref<boolean>(false); // 是否需要绑定手机号
    const IsTestPlay = ref<boolean>(uni.getStorageSync('IsTestPlay') || false);
    const RoleId = ref<any>(uni.getStorageSync('RoleId') || '');
    const GameCode = ref<GameCodeType>(uni.getStorageSync('GameCode') || '');
    const PlayInfo = ref<PlayInfos | null>();

    const Auth = (data?: { avatar: string, nickname: string, iv?: string, encryptedData?: string }) => {
        return new Promise((resolve, reject) => {
            uni.login({
                provider: "weixin",
                success: async (res) => {
                    try {
                        let response;
                        if (data?.iv) {
                            // 绑定手机并登录
                            response = await auth_BindTel({
                                code: res.code,
                                iv: data.iv,
                                encryptedData: data.encryptedData
                            })
                        } else {
                            // 直接登录
                            response = await authorizations({
                                code: res.code
                            })
                        }
                        // 已绑定手机号
                        IsNeedBindTel.value = false;
                        Token.value = response.token;
                        LemToken.set(response.token);
                        if (data) {
                            // 设置头像昵称
                            await updatePlayerInfos({
                                avatar: data?.avatar,
                                nickname: data?.nickname
                            })
                        }
                        resolve(response)
                    } catch (err: any) {
                        // 未绑定手机号
                        IsNeedBindTel.value = true;
                        reject();
                    }
                }
            })
        })
    }

    // 分发跳转
    const Init = async (query: QrParams) => {
        console.log('----Init----')
        console.log('PlayInfo:', PlayInfo.value)
        console.log('InitQuery:', query)
        if (query.name != GameCode.value) {
            // 两次扫码不同处理
            PlayInfo.value = null;
        };
        // TODO 第二次扫同一个码导致进入不了小程序
        let Options =  uni.getEnterOptionsSync();
        // 处理扫描同一个小程序码
        if (PlayInfo.value?.running_room && Options.path !== 'pages/index/index') return;
        SetGemeInfo(query.name, query.id);
        try {
            if (['nzgx', 'lan'].includes(GameCode.value)) {
                // 新进入方式（顶流网红还是旧的一套）
                if (!Token.value) await Auth();
                let res = await getPlayInfos();
                PlayInfo.value = res;
            };
            if (PlayInfo.value?.running_room) {
                JumpStartPage();
            } else {
                JumpPasswordPage();
            }
        } catch (err: any) {
            // 登录失败/失效
        }
    }

    // 调整密码页
    const JumpPasswordPage = () => {
        uni.reLaunch({
            url: GamePasswordPath[GameCode.value]
        })
    }

    // 跳转主页
    const JumpStartPage = () => {
        uni.reLaunch({
            url: GameStartPath[GameCode.value]
        })
    }

    // 加入房间
    const JoinRoom = async (role_id: number | string, room_number: number | string) => {
        try {
            let res = await joinRoom({
                role_id,
                room_number
            })
            SetTestMode(res.is_imitate == 1 ? true : false);
        } catch (err: any) {
            throw err
        }
    }

    // 设置测试模式
    const SetTestMode = (isTest: boolean) => {
        uni.setStorageSync('IsTestPlay', isTest);
        IsTestPlay.value = isTest;
    }

    // 设置游戏信息
    const SetGemeInfo = (name: GameCodeType, role_id: any) => {
        uni.setStorageSync('GameCode', name);
        uni.setStorageSync('RoleId', role_id);
        RoleId.value = role_id;
        GameCode.value = name;
    }

    const ClearGameInfo = () => {
        // uni.setStorageSync('GameCode', '');
        SetTestMode(false);
        uni.setStorageSync('RoleId', '');
        LemToken.clear();
        Token.value = "";
    }

    // 关闭房间
    const ClearRoom = () => {
        ClearGameInfo();
        uni.showModal({
            title: "提示",
            content: `房间已关闭`,
            showCancel: false,
            confirmText: "知道了",
            confirmColor: "#323232",
            success: async (e) => {
                if (e.confirm) {
                    uni.exitMiniProgram();
                    // uni.reLaunch({
                    //     url: GameIndexPath[GameCode.value]
                    // })
                };
            }
        })
    }

    // 被踢出房间
    const BanRoom = () => {
        ClearGameInfo();
        uni.showModal({
            title: "提示",
            content: `你被DM踢出`,
            showCancel: false,
            confirmText: "知道了",
            confirmColor: "#323232",
            success: async (e) => {
                if (e.confirm) {
                    uni.exitMiniProgram();
                    // uni.reLaunch({
                    //     url: GameIndexPath[GameCode.value]
                    // })
                };
            }
        })
    }

    // 退出登录
    const LoginOut = () => {
        SetTestMode(false);
        LemToken.clear();
        Token.value = "";
        if (RoleId.value) {
            Init({ name: GameCode.value, id: RoleId.value });
        } else {
            ClearGameInfo();
            uni.reLaunch({
                url: "/pages/index/index"
            })
        }
    }

    return {
        Token,
        RoleId,
        GameCode,
        IsTestPlay,
        IsNeedBindTel,
        PlayInfo,
        Auth,
        Init,
        SetGemeInfo,
        JoinRoom,
        SetTestMode,
        ClearGameInfo,
        ClearRoom,
        BanRoom,
        LoginOut
    }
})