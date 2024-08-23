import { PlayFetcher } from "./index";

export interface AuthResponse {
  token: string;
  userinfo: {
    // 1=DM  2=player
    type: 1 | 2;
  };
}

export interface AuthData {
  code: string;
  iv?: string;
  encryptedData?: string;
}

// 玩家登录
export const authorizations = (data: AuthData): Promise<AuthResponse> => {
  return PlayFetcher().post("/authorizations", data);
};

// 设置玩家信息
export interface PlayerInfos {
  avatar?: string;
  nickname?: string;
}
export const updatePlayerInfos = (data: PlayerInfos) => {
  return PlayFetcher().post("/player_info", data);
};

// 玩家登录 + 绑定手机
export const auth_BindTel = (data: AuthData): Promise<AuthResponse> => {
  return PlayFetcher().post("/authorizations/bind_tel", data);
};

export interface JoinData {
  role_id: number | string;
  room_number: number | string;
}

export interface JoinResponse {
  host: string
  is_imitate: number
  message: string
}

// 进入房间
export const joinRoom = (data: JoinData): Promise<JoinResponse> => {
  return PlayFetcher().post("/join_room", data);
};

export interface PlayInfos {
  DM: string
  account_type: string
  people_number: number
  room_end_time: string
  room_number: string
  running_room: boolean
  script_id: number
  script_name: string
  script_preview: string
}

// 获取开本信息
export const getPlayInfos = (): Promise<PlayInfos> => {
  return PlayFetcher().get("/kaibeninfo", {});
};
