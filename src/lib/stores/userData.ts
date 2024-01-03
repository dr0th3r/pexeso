import { writable } from "svelte/store";

import defaultPacks from "../defaultPacks";

import { Pack, UserData, DBUserData } from "../types";

export function createUserTemplate(
  displayName = `anonymous${Math.floor(Math.random() * 1000)}`
): UserData {
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

export function createDBUserTemplate(displayName = "anonymous", packs=[]) {
  return {
    displayName: displayName,
    chosenPackId: 0,
    gamesPlayed: 0,
    leastCardsFlipped: Infinity,
    mostFoundInRow: 0,
    packs: packs,
  };
}

export const userData = createUserDataStore();

function createUserDataStore() {
  const { subscribe, set, update } = writable(createUserTemplate());

  return {
    subscribe,
    set,
    update,
    createNewUser: (displayName: string) => set(createUserTemplate(displayName)),
    setFromDBData: (data: DBUserData) => {
      set({
        ...createUserTemplate(data?.displayName),
        ...data,
        packs: [
          ...Object.entries(data?.packs || {}).map(([key, value]) => ({
            ...value,
            id: key 
          })),
          ...defaultPacks
        ]
      });
    },
  };
}
