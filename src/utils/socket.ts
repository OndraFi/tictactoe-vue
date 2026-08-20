import { Client } from "colyseus.js";
import local from "../conf/local";

let client: Client | null = null;

export function getClient() {
    if (client === null) {
        client = new Client(local.SOCKET_URL);
    }
    return client;
}
