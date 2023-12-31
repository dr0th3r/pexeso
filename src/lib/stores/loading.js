import { writable } from "svelte/store";

export const loadingStore = createLoadingStore();

function createLoadingStore() {
    const { subscribe, set, update } = writable({
        isLoading: false,
        progress: 0, //0-100
        message: "",
    });

    return {
        subscribe,
        set,
        update,
        startLoading: (message = "") => {
            set({
                isLoading: true,
                progress: 0,
                message: message,
            });
        },
        updateProgress: (progress) => {
            update((curr) => ({
                ...curr,
                progress: progress * 100,
            }))
        },
        stopLoading: () => {
            set({
                isLoading: false,
                progress: 0,
                message: "",
            });
        },
    }
}