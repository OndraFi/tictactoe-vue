import {ref, computed} from 'vue'
import {defineStore} from 'pinia'

interface User {
    id: number;
    username: string;
    email: string;
    roles: Array<string>;
    accessToken: string;
}

interface StoreState {
    user: User | null;
    stats: any;
}

export const useStore = defineStore('store', {
    state: (): StoreState => ({
        user: null,
        stats: null
    }),
    persist: true,
})
