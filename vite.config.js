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

      constructor(lobbyInfo, cards) {
        this.lobbyInfo = lobbyInfo;
        this.cards = cards;
      }

      in() {
        return io.in(lobbyInfo.lobbyId);
      }

      nextPlayer() {
        this.playerOnTurn++;
        if(this.playerOnTurn >= this.lobbyInfo.players.length)
          this.playerOnTurn = 0;

        this.in().emit("next player", this.playerOnTurn);
      }
    }
    
    const lobbies = {};

    io.on("connection", (socket) => {
      let lobby = null;

      socket.emit("testingEvent", "Hello World!");

      socket.on("create lobby", (username, pack) => {
        let socketId = socket.id;

        let lobbyId = `${socketId}_lobby`;

        const lobbyInfo = {
          //lobby template
          id: lobbyId,
          pack: pack,
          joinable: true,
          players: [],
        };

        lobbies[lobbyId] = new Lobby(lobbyInfo, createCards(pack));
        lobby = lobbies[lobbyId];

        joinGame(lobbyId, username);
        io.to(socketId).emit("create lobby", lobbyInfo);
      });

      socket.on("join lobby", (username, lobbyId) => {
        if (!lobbies[lobbyId]) {
          socket.emit("error", "No such lobby");
        } else if (!lobbies[lobbyId]?.lobbyInfo.joinable) {
          console.log("user attempted to join running lobby");
          socket.emit("error", "You attempted to join running lobby");
        } else {
          lobby = lobbies[lobbyId];
          
          joinGame(lobbyId, username);
          lobby.in().emit("join lobby", lobby);
        }
      });

      socket.on("toggle ready", () => {
        const lobbyInfo = lobby.lobbyInfo;
        const players = lobby?.players;

        const player = players?.find((player) => player.id === socket.id);

        player.ready = !player.ready;

        lobby.in().emit("toggle ready", socket.id);

        if (!players.find((player) => !player.ready)) {
          players.forEach((player) => (player.ready = false));
          lobbyInfo.playerOnTurn = 0;
          lobbyInfo.joinable = false;
          lobby.in().emit("start game", lobbyInfo);
        }
      });

      socket.on("flip card", index => {

      });

      socket.on("card match", (matchedPairs) => {
        const playerStats = lobbies[lobbyId]?.lobbyInfo.players.find(
          (player) => player.id === socket.id
        )?.stats;

        playerStats.pairsFound = playerStats.pairsFound + 1 || 1;
        playerStats.currMostInRow = playerStats.currMostInRow + 1 || 1;

        playerStats.mostInRow =
          playerStats.currMostInRow || playerStats.mostInRow || 1;

        lobby.in().emit("card match", matchedPairs);
      });

     /* socket.on("next player", (lobbyId) => {
        //possible optimalization - send it only to previously on turn and now on turn player
        //there are also many more possible optimalizations
        const lobby = lobbies[lobbyId];

        const playerStats = lobby?.players.find(
          (player) => player.id === socket.id
        )?.stats;
        playerStats.currMostInRow = 0;

        let nextPlayer = lobby.playerOnTurn + 1;
        if (nextPlayer >= lobby?.players?.length) {
          nextPlayer = 0;
        }

        lobby.playerOnTurn = nextPlayer;

        io.in(lobbyId).emit("next player", nextPlayer);
      });*/

      socket.on("show stats", () => {
        //we need to update stats first
        const playerStats = lobbies[lobbyId]?.players.find(
          (player) => player.id === socket.id
        )?.stats;

        playerStats.pairsFound = playerStats.pairsFound + 1 || 1;
        playerStats.currMostInRow = playerStats.currMostInRow + 1 || 1;

        playerStats.mostInRow =
          playerStats.currMostInRow || playerStats.mostInRow || 1;

        //and then display them
        lobby.in().emit("show stats", lobbies[lobbyId]?.players);
      });

      socket.on("leave lobby", (lobbyId, autoLobbyDelete = false) => {
        const lobby = lobbies[lobbyId];

        const players = lobby?.players?.filter(
          (player) => player.id !== socket.id
        ) || [];

        lobby.players = players;

        socket.to(lobbyId).emit("player left lobby", players);

        io.in(socket.id).emit("you left lobby");

        if (players?.length <= 0 || (players?.length <= 1 && autoLobbyDelete)) {
          socket.to(lobbyId).emit("delete lobby");
          io.socketsLeave(lobbyId);
        } else {
          socket.leave(lobbyId);
        }
      });

      socket.on("disconnect", () => {
        if (lobby !== null) {
          const lobbyId = lobby.lobbyInfo.id;

          if (lobby.players[lobby.playerOnTurn]?.id === socket?.id) {
            //if the disconnected player was on turn, we don't want any cards to remain flipped
            socket.to(lobbyId).emit("flip card", []);
          }

          lobby.lobbyInfo.players = lobby.lobbyInfo.players.filter(
            (player) => player?.id !== socket?.id
          );

          if (lobby.lobbyInfo.players.length <= 1) {
            //you shouldn't be able to play in 1 player
            socket.to(lobbyId).emit("delete lobby");
            io.socketsLeave(lobbyId);
          } else {
            if (lobby.playerOnTurn > lobby.players.length - 1) {
              lobby.playerOnTurn = 0;
              socket.to(lobbyId).emit("next player", 0);
            }

            socket.to(lobbyId).emit("player left game", lobby.players);
          }
        }
      });

      function joinGame(lobbyId, username) {
        lobbies[lobbyId].lobbyInfo["players"].push({
          id: socket.id,
          name: username,
          ready: false,
          stats: {
            pairsFound: 0,
            mostInRow: 0,
            currMostInRow: 0,
          },
        });

        socket.join(lobbyId);
      }
    
    });
  },
};

function createCards(imgUrls) {
  const cards = [];

  for (let i = 0; i < imgUrls.length; i++) {
    cards.push(
      //we have to create pairs of cards - that means 2 cards per 1 img
      {
        cardId: i * 2,
        groupId: i,
        imgUrl: imgUrls[i],
      },
      {
        cardId: i * 2 + 1,
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
