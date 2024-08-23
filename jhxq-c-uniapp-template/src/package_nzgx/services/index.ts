import { useMainAuthStore } from "@/stores/auth";
import MyFetch from "@/utils/LemFetch";
import { LemToken } from "@/utils/auth";

// const DM_Api_Url = "https://lan.api.wanjuyuanxian.com/api/dm";
const DM_Api_Url = "http://mn.nzgx.api.wanjuyuanxian.com/api/dm"; // 正式开本
const DM_TEST_Api_Url = "http://mn.nzgx.api.wanjuyuanxian.com/api/dm"; // 模拟开本

// b端
export const DMFetcher = () => {
  const ScriptStore = useMainAuthStore();
  MyFetch.token = LemToken.get();
  MyFetch.baseUrl = ScriptStore.IsTestPlay ? DM_TEST_Api_Url : DM_Api_Url;
  return MyFetch;
};
