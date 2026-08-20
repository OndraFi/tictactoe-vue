import axios from "axios";
import {useStore} from "@/stores/store";
export default class Stats {
    url: string;
    store: any;
    constructor(baseUrl:string) {
        this.url = baseUrl;
        this.store = useStore();
    }
    async get(){
        return await axios.get(this.url + "stats/getUserStats", {headers: {'x-access-token':  this.store.user.accessToken}});
    }

    async getLeaderboard(mode: string){
        const userId = this.store.user?.id || '';
        return await axios.get(this.url + `stats/leaderboard/${mode}?userId=${userId}`);
    }
}