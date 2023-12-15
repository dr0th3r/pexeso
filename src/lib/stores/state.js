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
      }
    case "playingSingleplayer":
      if (event.type === "showStatistics") {
        return "inStatistics";
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
  }
}

export default useMachine(gameMachine, "inMainMenu");
