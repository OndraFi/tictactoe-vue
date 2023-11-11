import axios from "axios";
export default class Auth {

    url: string;
    constructor(baseUrl:string) {
        this.url = baseUrl;
    }

    async signUp(username: string,email: string, password: string) {
        console.log("api register");
        return await axios.post(this.url + "auth/signup", {username: username, email: email, password: password});
    }

    async signIn(username: string, password: string){
        return await axios.post(this.url + "auth/signin", { username: username, password: password});
    }

}