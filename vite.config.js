import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

/* const webSocketServer = {
  name: "webSocketServer",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    const lobbys = {};

    io.on("connection", (socket) => {
      socket.emit("eventFromServer", "Hello, World 👋");

      socket.on("createGame", () => {
        const lobbyId = `${socket.id}-lobby`;
        socket.join(lobbyId);
        lobbys[lobbyId] = {
          players: {
            [socket.id]: {
              points: 0,
            },
          },
          onTurn: 0,
        };
      });

      socket.on("joinLobby", (lobbyId, callback) => {
        socket.join(lobbyId);

        socket.to(lobbyId).emit("playerJoin", socket.id);

        lobbys[lobbyId].players = {
          ...lobbys[lobbyId].players,
          [socket.id]: {
            points: 0,
          },
        };

        console.log(lobbys);

        callback({
          status: 200,
          players: Object.keys(lobbys[lobbyId].players),
        });
      });

      socket.on("gameStart", (lobbyId) => {
        io.in(lobbyId).emit("startGame");

        const { players, onTurn } = lobbys[lobbyId];

        const playerOnTurn = Object.keys(players)[onTurn];

        //io.in(lobbyId).emit("updateOnTurn", playersInLobby[currentlyOnTurn]);
        io.in(playerOnTurn).emit("setOnTurn", true);
      });

      socket.on("flipCards", (lobbyId, flippedCards) => {
        console.log(lobbyId);

        io.in(lobbyId).emit("flipCards", flippedCards);
      });

      socket.on("nextPlayer", (lobbyId) => {
        const lobby = lobbys[lobbyId];
        const players = Object.keys(lobby.players);

        if (lobby.onTurn + 1 >= players.length) {
          lobbys[lobbyId].onTurn = 0;
        } else {
          lobbys[lobbyId].onTurn = lobby.onTurn + 1;
        }

        console.log(lobby);

        const playerOnTurn = players[lobby.onTurn];

        io.in(playerOnTurn).emit("setOnTurn", true);
        io.in(lobbyId).except(playerOnTurn).emit("setOnTurn", false);
      });

      socket.on("addPoint", (lobbyId) => {
        lobbys[lobbyId].players[socket.id].points += 1;
      });

      socket.on("showStats", (lobbyId) => {
        io.in(lobbyId).emit("showStats", lobbys[lobbyId].players);
      });

      io.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  },
}; */

const lobbies = {};

const webSocketServer = {
  name: "webSocketServer",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      socket.emit("testingEvent", "Hello World!");

      socket.on("create lobby", (username, pack) => {
        let socketId = socket.id;

        const lobbyId = `${socketId}_lobby`;

        const lobbyInfo = {
          //lobby template
          pack: pack,
          playerOnTurn: 0,
          players: [
            {
              id: socketId,
              name: username,
              ready: false,
              stats: {
                pairsFound: 0,
              },
            },
          ],
        };

        lobbies[lobbyId] = lobbyInfo;

        socket.join(lobbyId);

        io.to(socketId).emit("create lobby", { id: lobbyId, ...lobbyInfo });
      });

      socket.on("join lobby", (username, lobbyId) => {
        if (!lobbies[lobbyId]) {
          socket.emit("error", "No such lobby");
        } else {
          lobbies[lobbyId]["players"].push({
            id: socket.id,
            name: username,
            ready: false,
            stats: {
              pairsFound: 0,
            },
          });

          const lobbyInfo = lobbies[lobbyId];

          socket.join(lobbyId);

          io.in(lobbyId).emit("join lobby", { id: lobbyId, ...lobbyInfo });
        }
      });

      socket.on("toggle ready", (lobbyId) => {
        const players = lobbies[lobbyId]?.players;

        const player = players?.find((player) => player.id === socket.id);
        const isReady = player.ready;

        player.ready = !isReady;

        io.in(lobbyId).emit("toggle ready", socket.id);

        let allPlayersReady = players.find((player) => !player.ready)
          ? false
          : true;

        if (allPlayersReady) {
          io.in(lobbyId).emit("start game");
        }
      });

      socket.on("flip card", (lobbyId, flippedCards) => {
        socket.to(lobbyId).emit("flip card", flippedCards);
      });

      socket.on("card match", (lobbyId, matchedPairs) => {
        const playerStats = lobbies[lobbyId]?.players.find(
          (player) => player.id === socket.id
        )?.stats;

        playerStats.pairsFound = playerStats.pairsFound + 1 || 1;

        socket.to(lobbyId).emit("card match", matchedPairs);
      });

      socket.on("next player", (lobbyId) => {
        //possible optimalization - send it only to previously on turn and now on turn player
        //there are also many more possible optimalizations
        const lobby = lobbies[lobbyId];

        let nextPlayer = lobby.playerOnTurn + 1;
        if (nextPlayer >= lobby?.players?.length) {
          nextPlayer = 0;
        }

        lobby.playerOnTurn = nextPlayer;

        io.in(lobbyId).emit("next player", nextPlayer);
      });

      socket.on("show stats", (lobbyId) => {
        const players = lobbies[lobbyId]?.players;

        socket.to(lobbyId).emit("show stats");

        io.in(lobbyId).emit("return stats", players);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  },
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
