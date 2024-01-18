import { writable } from "svelte/store";

import defaultPacks from "../defaultPacks";

import type { Pack, UserData, DBUserData } from "../types";
import type { DocumentData } from "firebase/firestore";

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
    mostPairsFound: 0,
  };
}

export function createDBUserTemplate(displayName = "anonymous", packs: Pack[] =[]) {
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
    createNewUser: (displayName?: string) => set(createUserTemplate(displayName)),
    setFromDBData: (data: DocumentData) => {
      const dataPacks = data.pack as {
        [key: string]: {
          title: string;
          imgRefPaths: string[];
          imgUrls: string[];
        };
      }

      if (!dataPacks || Object.keys(dataPacks).length === 0) {
        set(
          createUserTemplate(data?.displayName)
        );
        return
      }
   

      set({
        ...createUserTemplate(data?.displayName),
        ...data,
        packs: [
          ...Object.entries(dataPacks).map(([key, value]) => {
            return {
              title: value.title,
              imgRefPaths: value.imgRefPaths,
              imgUrls: value.imgUrls,
            };
          }),
          ...defaultPacks
        ],
      } as UserData); // Add 'as UserData' to explicitly specify the type
    },

  };
}
