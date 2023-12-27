import { writable } from "svelte/store";

export const userData = createUserDataStore();

function createUserDataStore() {
    const { subscribe, set, update } = writable({});

    return {
        subscribe,
        set,
        update,
        createNewUser: (displayName) => {
            set({
                displayName: displayName,
                fastestSolved: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                mostFoundInRow: 0,
                packs: [],
            })
        }
    }
}



