import { writable } from "svelte/store";

import { authStore } from "./auth";

import { Event } from "../types";

function useMachine(machine: (state: string, event: Event) => string, initialState: string) {
  const state = writable(initialState);

  function emit(event: Event) {
    state.update((state) => machine(state, event));
  }

  return { state, emit };
}

function gameMachine(state: string, event: Event): string {
  switch (state) {
    case "inMainMenu":
      if (event.type === "startSingleplayer") {
        return "playingSingleplayer";
      } else if (event.type === "goToCardMenu") {
        return "inCardMenu";
      } else if (event.type === "goToLobbyMenu") {
        return "inLobbyMenu";
      } else if (event.type === "goToSignInMenu" && event.user === null) {
        return "inSignInMenu";
      }
      else if (event.type === "goToLeaderboards") {
        return "inLeaderboards"
      }
    case "playingSingleplayer":
      if (event.type === "showStatistics") {
        return "inStatistics";
      }
    case "playingMultiplayer":
      if (event.type === "showStatistics") {
        return "inStatistics";
      }
    case "inLobbyMenu":
      if (event.type === "startMultiplayer") {
        return "playingMultiplayer";
      } else if (event.type === "goToMainMenu") {
        return "inMainMenu";
      }
    case "inStatistics":
      if (event.type === "startSingleplayer") {
        return "playingSingleplayer";
      } else if (event.type === "goToMainMenu") {
        return "inMainMenu";
      } else if (event.type === "startMultiplayer") {
        return "playingMultiplayer";
      }
    case "inCardMenu":
      if (event.type === "goToMainMenu") {
        return "inMainMenu";
      }
    case "inSignInMenu":
      if (event.type === "goToMainMenu") {
        return "inMainMenu";
      }
    case "inLeaderboards":
      if (event.type === "goToMainMenu") {
        return "inMainMenu";
      }
    default:
      console.log(event.type);
      return state;
  }
}

export default useMachine(gameMachine, "inMainMenu");
