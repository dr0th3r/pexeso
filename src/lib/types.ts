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
  mostPairsFound: number;
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

type Player = {
  id: string,
  name: string,
  ready: boolean,
  stats: {
    leastCardsFlipped: number,
    currCardsFlipped: number,
    gamesPlayed: number,
    mostFoundInRow: number,
    currMostFoundInRow: number,
    mostPairsFound: number,
    pairsFound: number,
  },
}

type LobbyInfo = {
  id: string,
  pack: Pack,
  players: Player[]
} | null

type Message = {
  name: string,
  msg: string,
}

type Card = {
  cardId: number,
  groupId: number,
  imgUrl: string,
}

type LeaderboardUser = {
  username: string,
  gamesPlayed: number,
  leastCardsFlipped: number,
  mostFoundInRow: number,
}

export type { NewFile, Pack, DBPack, DBPacks, SignData, Event, UserData, DBUserData, LobbyInfo, Player, Message, Card, LeaderboardUser}