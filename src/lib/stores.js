import { writable, get } from "svelte/store";

export const imgUrls = writable([])


export function createUserStatisticsStore(data) {
    const currentUserStatistics = writable(data);
    const {set, subscribe, update} = currentUserStatistics; //we get the methods used for interaction with the store
    const isBrowser = typeof window !== "undefined"; //we check if the code is executed on the client side, because only there we can access localStorage

    if (isBrowser && localStorage.userStatistics) { //if there are any userStatistics in the  localStorage, we update the store
        set(JSON.parse(localStorage.userStatistics))
    }

    return { //we return rewritten original methods so that we can update the table as well as the local storage
        subscribe, 
        set: (value) => {
            isBrowser && (localStorage.userStatistics = JSON.stringify(value));
            set(value);
        },
        update: (callback) => {
          const updatedStore = callback(get(currentUserStatistics));
          
          isBrowser && (localStorage.userStatistics = JSON.stringify(updatedStore));
          set(updatedStore);
        }
    }
}
