import { writable } from "svelte/store";

import defaultPacks from "../defaultPacks";

interface Pack {
  id: string | number;
  title: string;
  imgUrls: string[];
  imgRefPaths?: string[];
}

interface UserData {
  displayName: string;
  leastCardsFlipped: number;
  currCardsFlipped: number;
  gamesPlayed: number;
  gamesWon: number;
  mostFoundInRow: number;
  currMostFoundInRow: number;
  packs: Pack[];
  chosenPack: Pack;
  modifiedPack: Pack | null;
}

interface DBUserData {
  displayName: string;
  chosenPackId: number;
  gamesPlayed: number;
  leastCardsFlipped: number;
  mostFoundInRow: number;
  packs: {
    [key: string]: {
      title: string;
      imgRefPaths: string[];
      imgUrls: string[];
    };
  };
}

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
