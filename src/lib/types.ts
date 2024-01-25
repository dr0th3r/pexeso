interface Pack {
  name: string;
  imgUrls: string[];
  chosenSize: number;
}

interface DBPacks {
  [id: string]: Pack;
}

interface ClientPack extends Pack {
  id: string;
}

interface GameStats { //stats during the game
  name: string;
  mostCardsFoundInRow: number;
  currCardsFlipped: number;
  currCardsFoundInRow: number;
  currTime: number;
}

interface User {
  name: string;
  stats: {
    gamesPlayed: number;
    winCount: number;
    leastCardsFlipped: number;
    mostCardsFoundInRow: number;
    bestTime: number;
  }
  selectedPackId: string;
}

interface ClientUser extends User {
  dbId: string;
  packs: ClientPack[];
  socketId: string;
}

interface SocketUser extends User {
  socketId: string;
  ready: boolean;
  stats: { //maybe improve later
    gamesPlayed: number;
    winCount: number;
    leastCardsFlipped: number;
    mostCardsFoundInRow: number;
    bestTime: number;

    currCardsFlipped: number;
    currCardsFoundInRow: number;
    currTime: number;
  }
}

interface DBUser extends User {
  packs: DBPacks;
}

interface Card {
  id: number;
  imgUrl: string;
}

interface SocketCard extends Card {
  groupId: number;
}

interface LobbyInfo {
  id: string;
  players: {
    id: string;
    name: string;
    ready: boolean;
  }[]
}

export type { ClientUser, DBUser, SocketUser, ClientPack, DBPacks, Card, SocketCard, GameStats, LobbyInfo, Pack }