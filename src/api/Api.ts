import Auth from './Auth';
import Stats from "./Stats";
import axios from "axios";
export default class Api {
    auth: Auth;
    stats: Stats;
    url: string;
    constructor(baseUrl: string) {
        this.auth = new Auth(baseUrl);
        this.stats = new Stats(baseUrl);
        this.url = baseUrl;
    }

    async playersInGame(){
        return await axios.get(this.url + "playersingame");
    }
}