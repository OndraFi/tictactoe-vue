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

}