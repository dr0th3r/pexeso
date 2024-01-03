interface NewFile {
  url: string;
  path: string;
}

interface Pack {
  id: string | number;
  title: string;
  imgUrls: string[];
  imgRefPaths?: string[];
}

interface DBPack {
  title: string;
  imgRefPaths: string[];
  imgUrls: string[];
}

interface DBPacks {
  [key: string]: DBPack;
}

interface SignData {
  displayName: string;
  chosenPackId: number;
  gamesPlayed: number;
  leastCardsFlipped: number;
  mostFoundInRow: number;
  packs: Pack[];
}

interface Event { 
  type: string;
  user?: any;
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

export { NewFile, Pack, DBPack, DBPacks, SignData, Event, UserData, DBUserData}