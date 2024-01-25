import { writable } from "svelte/store";

import gameStats  from "$lib/stores/gameStats";

import { socketStore } from "./socket";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;
socketStore.subscribe(value => socket = value);

const state = function(stateMachine: (state: string, event: { type: string }) => string) {
    const { subscribe, update } = writable("in main menu");

    return {
        subscribe,
        emit: (event: { type: string, sendLeaveGame?: boolean }) => update(curr => stateMachine(curr, event)),
    }
}(gameMachine);

function gameMachine(state: string, event: { 
    type: string
    sendLeaveGame?: boolean
}) {
    switch (state) {
        case "in main menu":
            if (event.type === "start game") {
                return "in game";
            } else if (event.type === "go to singin menu") {
                return "in signin menu";
            } else if (event.type === "start singleplayer") {
                return "playing singleplayer";
            } else if (event.type === "go to lobby menu") {
                return "in lobby menu";
            } else if (event.type === "go to pack menu") {
                return "in pack menu";
            } else if (event.type === "go to leaderboards") {
                return "in leaderboards"
            }
        case "in signin menu":
            if (event.type === "go to main menu") {
                return "in main menu";
            }
        case "playing singleplayer":
            if (event.type === "go to main menu") {
                gameStats.set({});
                return "in main menu";
            } else if (event.type === "show statistics") {
                return "showing statistics";
            }
        case "playing multiplayer":
            if (event.type === "go to main menu") {
                gameStats.set({}); //emit leaving lobby

                event?.sendLeaveGame && socket?.emit("leave game", true);
                return "in main menu";
            } else if (event.type === "show statistics") {
                return "showing statistics";
            }
        case "showing statistics":
            if (event.type === "go to main menu") {
                socket?.emit("leave game", true);
                return "in main menu";
            } else if (event.type === "start singleplayer") {
                return "playing singleplayer";
            }
        case "in lobby menu":
            if (event.type === "go to main menu") {
                event?.sendLeaveGame && socket?.emit("leave game");
                return "in main menu";
            } else if (event.type === "start multiplayer") {
                return "playing multiplayer";
            }
        case "in pack menu":
            if (event.type === "go to main menu") {
                return "in main menu";
            }
        case "in leaderboards":
            if (event.type === "go to main menu") {
                return "in main menu";
            }
        default:
            console.log(event.type)
            return state;
    }
}

export default state;