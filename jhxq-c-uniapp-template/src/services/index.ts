import MyFetch from "@/utils/LemFetch";
import { LemToken } from "@/utils/auth";

const baseUrl = import.meta.env.VITE_PLAY_API + '/api';

export const PlayFetcher = () => {
    MyFetch.baseUrl = baseUrl;
    MyFetch.token = LemToken.get();
    return MyFetch
}