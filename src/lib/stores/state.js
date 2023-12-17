import { writable } from "svelte/store";

function useMachine(machine, initialState) {
  const state = writable(initialState);

  function emit(event) {
    state.update((state) => machine(state, event));
  }

  return { state, emit };
}

function gameMachine(state, event) {
  switch (state) {
    case "inMainMenu":
      if (event.type === "startSingleplayer") {
        return "playingSingleplayer";
      } else if (event.type === "goToCardMenu") {
        return "inCardMenu";
      } else if (event.type === "goToLobbyMenu") {
        return "inLobbyMenu";
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
      }
    case "inStatistics":
      if (event.type === "startSingleplayer") {
        return "playingSingleplayer";
      } else if (event.type === "goToMainMenu") {
        return "inMainMenu";
      }
    case "inCardMenu":
      if (event.type === "goToMainMenu") {
        return "inMainMenu";
      }
    default:
      console.log(event.type);
      return state;
  }
}

export default useMachine(gameMachine, "inMainMenu");
