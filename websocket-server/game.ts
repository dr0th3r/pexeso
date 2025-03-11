import type { Card, ClientPack, ClientUser, SocketCard, SocketUser, GameStats, LobbyInfo } from "../src/lib/types";

export default class Game {
    players: SocketUser[] = [];
    pack: ClientPack | null = null;
    cards: SocketCard[] = [];
    flippedCards: SocketCard[] = [];
    matchedCards: SocketCard[] = [];
    id: string = "";
    running: boolean = false;
    playerOnTurn: number = 0;

    constructor(id: string, pack: ClientPack) {
      this.id = id;
      this.pack = pack;
    }

    joinGame(player: ClientUser) {
      if (this.players.some(p => p.socketId === player.socketId)) return;

      this.players.push({
        ...player,
        ready: false,
        stats: {
          ...player.stats,
          leastCardsFlipped: player.stats.leastCardsFlipped || Infinity, //for some reason infinity = null for socketio
          bestTime: player.stats.bestTime || Infinity, //same reason as line above
          currCardsFlipped: 0,
          currCardsFoundInRow: 0,
          currTime: 0
        }
      });
    }

    leaveGame(socketId: string) {
      this.players = this.players.filter(player => player.socketId !== socketId);
    }

    startGame() {
      this.players.forEach(player => {
        player.ready = false;

        const playerStats = player.stats;

        playerStats.currCardsFlipped = 0;
        playerStats.currCardsFoundInRow = 0;
        playerStats.mostCardsFoundInRow = 0;
        playerStats.currTime = 0;
      })

      this.flippedCards = [];
      this.matchedCards = [];

      this.running = true;
      
      this.cards = this.createCards(this.pack!.imgUrls.slice(0, this.pack!.chosenSize / 2)); 
      //chosen size is total number of cards, so we need to divide it by 2 to get number of pairs
    }

    createCards(imgUrls: string[]) {
      const cards: SocketCard[] = [];

      const ids = Array.from({ length: imgUrls.length * 2 }, (_, i) => i);
      ids.sort(() => Math.random() - 0.5);

      for (let i = 0; i < imgUrls.length; i++) {
        cards.push(
          {
            id: ids[i * 2],
            groupId: i,
            imgUrl: imgUrls[i]
          },
          {
            id: ids[i * 2 + 1],
            groupId: i,
            imgUrl: imgUrls[i]
          }
        )
      }

      return cards;
    }

    parseStats() {
      const player = this.players[this.playerOnTurn]
      const playerStats = player.stats

      return {
        id: player.socketId,
        newStats: <Partial<GameStats>>{
          mostCardsFoundInRow: playerStats.mostCardsFoundInRow,
          currCardsFlipped: playerStats.currCardsFlipped,
          currCardsFoundInRow: playerStats.currCardsFoundInRow,
          currTime: playerStats.currTime,
        }
      }
    }

    getInitialStats() {
      return this.players.map(player => {
        return {
          id: player.socketId,
          newStats: <GameStats>{
            name: player.name,
            mostCardsFoundInRow: 0,
            currCardsFlipped: 0,
            currCardsFoundInRow: 0,
            currTime: 0,
          }
        }
      })
    }


    getLobbyInfo() {
      return {
        id: this.id,
        players: this.players.map(player => {
          return {
            id: player.socketId,
            name: player.name,
            ready: player.ready
          }
        })
      } as LobbyInfo
    }
  }