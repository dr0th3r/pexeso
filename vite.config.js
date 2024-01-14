import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

const webSocketServer = {
  name: "webSocketServer",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    class Lobby {
      playerOnTurn = 0;
      running = false;
      flippedCards = [];
      matchedCards = [];
      players = [];
      id;
      pack;
      cards;

      constructor(id, pack) {
        this.id = id;
        this.pack = pack;
      }

      serialize() {
        return {
          id: this.id,
          pack: this.pack,
          players: this.players,
        };
      }

      in() {
        return io.in(this.id);
      }

      nextPlayer() {
        if (++this.playerOnTurn >= this.players.length) this.playerOnTurn = 0;

        this.in().emit("next player", this.playerOnTurn);
      }

      removePlayer(playerId) {
        this.players = this.players.filter((player) => player?.id !== playerId);
      }

      resetFlippedCards() {
        setTimeout(() => {
          this.in().emit("reset flipped cards");
          this.flippedCards = [];
        }, 1000);
      }

      cardMatch(playerId) {
        const playerStats = this.players.find(
          (player) => player.id === playerId
        )?.stats;

        playerStats.pairsFound++;

        setTimeout(() => {
          this.in().emit("card match", this.flippedCards);
        }, 1000);

        this.matchedCards.push(...this.flippedCards);

        this.resetFlippedCards();
      }

      endGame() {
        this.players.forEach((e) => {
          e.stats.gamesPlayed++;

          console.log(e.stats.currCardsFlipped);

          if (e.stats.leastCardsFlipped > e.stats.currCardsFlipped) {
            e.stats.leastCardsFlipped = e.stats.currCardsFlipped;
          }

          if (e.stats.mostPairsFound < e.stats.pairsFound) {
            e.stats.mostPairsFound = e.stats.pairsFound;
          }

          io.to(e.id).emit("set stats", e.stats);
        });

        this.in().emit("show stats", this.players);

        this.matchedCards = [];
        this.flippedCards = [];
      }

      generateCards() {
        this.cards = createCards(this.pack);
      }

      joinGame(socket, username) {
        this.players.push({
          id: socket.id,
          name: username,
          ready: false,
          stats: {
            leastCardsFlipped: Infinity,
            currCardsFlipped: 0,
            gamesPlayed: 0,
            mostFoundInRow: 0,
            currMostFoundInRow: 0,
            mostPairsFound: 0,
            pairsFound: 0,
          },
        });

        socket.join(this.id);
      }

      startGame() {
        this.players.forEach((player) => {
          const playerStats = player.stats;

          player.ready = false;
          playerStats.currCardsFlipped = 0;
          playerStats.currMostFoundInRow = 0;
          playerStats.pairsFound = 0;
        });
        this.playerOnTurn = 0;
        this.running = true;
        this.generateCards();
        this.in().emit("start game", this.serialize());
      }

      leaveGame(socket, autoLobbyDelete) {
        this.players =
          this.players.filter((player) => player.id !== socket.id) || [];

        this.in().emit("player left lobby", this.players);

        io.in(socket.id).emit("you left lobby");

        if (
          this.players.length <= 0 ||
          (this.players.length <= 1 && autoLobbyDelete)
        ) {
          socket.to(this.id).emit("delete lobby");
          io.socketsLeave(this.id);
          delete lobbies[this.id];
        } else {
          socket.leave(this.id);
        }
      }
    }

    let lobbies = {};

    io.on("connection", (socket) => {
      let lobby = null;

      socket.on("create lobby", (username, singleplayer, pack) => {
        if (lobby != null) return;

        let lobbyId = `${socket.id}_lobby`;

        lobby = new Lobby(lobbyId, pack);
        lobbies[lobbyId] = lobby;

        lobby.joinGame(socket, username);
        socket.emit("lobby info", lobby.serialize());

        if (singleplayer) {
          lobby.startGame();
          socket.emit("start game", lobby.serialize());
        }
      });

      socket.on("join lobby", (username, lobbyId) => {
        if (lobby != null) return;

        if (!lobbies[lobbyId]) {
          socket.emit("error", "No such lobby");
        } else if (lobbies[lobbyId]?.running) {
          console.log("user attempted to join running lobby");
          socket.emit("error", "You attempted to join running lobby");
        } else {
          lobby = lobbies[lobbyId];

          lobby.joinGame(socket, username);
          socket.emit("lobby info", lobby.serialize());
          lobby.in().emit("join lobby", lobby.players);
        }
      });

      socket.on("toggle ready", () => {
        if (lobby == null) return;

        const players = lobby.players;

        const player = players?.find((player) => player.id === socket.id);

        player.ready = !player.ready;

        lobby.in().emit("toggle ready", socket.id);

        if (!players.find((player) => !player.ready)) {
          lobby.startGame();
        }
      });

      socket.on("chat", (message) => {
        if (lobby == null) return;

        lobby.in().emit("chat", message);
      });

      socket.on("set stats", (stats) => {
        if (lobby == null) return;

        let playerStats = lobby.players?.find(
          (player) => player.id === socket.id
        ).stats;

        playerStats.leastCardsFlipped = stats.leastCardsFlipped || Infinity;
        playerStats.gamesPlayed = stats.gamesPlayed || 0;
        playerStats.mostFoundInRow = stats.mostFoundInRow || 0;
        playerStats.mostPairsFound = stats.mostPairsFound || 0;

        console.log(playerStats);
      });

      socket.on("flip card", (index) => {
        if (lobby == null) return;

        if (lobby.players[lobby.playerOnTurn]?.id != socket.id) return;

        if (lobby.flippedCards.length >= 2) return;

        // Cards already visible
        if (
          lobby.flippedCards.find((e) => e.cardId == index) ||
          lobby.matchedCards.find((e) => e.cardId == index)
        )
          return;

        const card = lobby.cards.find((e) => e.cardId == index);
        lobby.flippedCards.push(card);
        lobby.in().emit("flip card", card);

        const playerStats = lobby.players[lobby.playerOnTurn].stats;
        playerStats.currCardsFlipped++;

        if (lobby.flippedCards.length == 2) {
          if (!lobby.flippedCards.find((e) => e.groupId != card.groupId)) {
            console.log(playerStats);
            if (playerStats.mostFoundInRow < ++playerStats.currMostFoundInRow) {
              playerStats.mostFoundInRow = playerStats.currMostFoundInRow;
            }

            lobby.cardMatch(socket.id);
            if (lobby.matchedCards.length == lobby.cards.length) {
              lobby.endGame();
            }
            return;
          }

          playerStats.currMostFoundInRow = 0;
          lobby.resetFlippedCards();
          lobby.nextPlayer();
        }
      });

      socket.on("leave lobby", (autoLobbyDelete = false) => {
        if (lobby == null) return;

        lobby.leaveGame(socket, autoLobbyDelete);
        lobby = null;
      });

      socket.on("disconnect", () => {
        if (lobby !== null) {
          if (lobby.players[lobby.playerOnTurn]?.id === socket?.id) {
            //if the disconnected player was on turn, we don't want any cards to remain flipped
            lobby.in().emit("reset flipped cards");
          }

          lobby.removePlayer(socket.id);

          if (lobby.players.length <= 1) {
            //you shouldn't be able to play in 1 player
            lobby.in().emit("delete lobby");
            io.socketsLeave(lobby.id);
          } else {
            if (lobby.playerOnTurn > lobby.players.length - 1) {
              lobby.playerOnTurn = 0;
              lobby.in().emit("next player", 0);
            }

            lobby.in().emit("player left game", lobby.players);
          }
        }
      });
    });
  },
};

function createCards(imgUrls) {
  const cards = [];
  const ids = Array.from(Array(imgUrls.length * 2), (x, i) => i);
  ids.sort(() => Math.random() - 0.5);

  for (let i = 0; i < imgUrls.length; i++) {
    cards.push(
      //we have to create pairs of cards - that means 2 cards per 1 img
      {
        cardId: ids[i * 2],
        groupId: i,
        imgUrl: imgUrls[i],
      },
      {
        cardId: ids[i * 2 + 1],
        groupId: i,
        imgUrl: imgUrls[i],
      }
    );
  }

  return cards;
}

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
