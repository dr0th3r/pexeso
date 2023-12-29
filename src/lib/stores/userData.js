import { writable } from "svelte/store";

import defaultPacks from "../defaultPacks";

export function createUserTemplate(
  displayName = `anonymous${Math.floor(Math.random() * 1000)}`
) {
  return {
    displayName: displayName,
    leastCardsFlipped: Infinity,
    currCardsFlipped: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    mostFoundInRow: 0,
    currMostFoundInRow: 0,
    packs: [...defaultPacks],
    chosenPack: defaultPacks[0],
    modifiedPack: null,
  };
}

export const userData = createUserDataStore();

function createUserDataStore() {
  const { subscribe, set, update } = writable(createUserTemplate());

  return {
    subscribe,
    set,
    update,
    createNewUser: (displayName) => set(createUserTemplate(displayName)),
  };
}
