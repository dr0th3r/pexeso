import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

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
          id: lobbyId,
          pack: pack,
          playerOnTurn: 0,
          players: [
            {
              id: socketId,
              name: username,
              ready: false,
              stats: {
                pairsFound: 0,
                mostInRow: 0,
                currMostInRow: 0,
              },
            },
          ],
        };

        lobbies[lobbyId] = lobbyInfo;

        socket.join(lobbyId);

        io.to(socketId).emit("create lobby", lobbyInfo);
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
              mostInRow: 0,
              currMostInRow: 0,
            },
          });

          const lobbyInfo = lobbies[lobbyId];

          socket.join(lobbyId);

          io.in(lobbyId).emit("join lobby", lobbyInfo);
        }
      });

      socket.on("toggle ready", (lobbyId) => {
        const lobby = lobbies[lobbyId];
        const players = lobby?.players;

        const player = players?.find((player) => player.id === socket.id);
        const isReady = player.ready;

        player.ready = !isReady;

        io.in(lobbyId).emit("toggle ready", socket.id);

        let allPlayersReady = players.find((player) => !player.ready)
          ? false
          : true;

        if (allPlayersReady) {
          players.forEach((player) => (player.ready = false));
          lobby.playerOnTurn = 0;
          io.in(lobbyId).emit("start game", lobby);
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
        playerStats.currMostInRow = playerStats.currMostInRow + 1 || 1;

        playerStats.mostInRow =
          playerStats.currMostInRow || playerStats.mostInRow || 1;

        socket.to(lobbyId).emit("card match", matchedPairs);
      });

      socket.on("next player", (lobbyId) => {
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
      });

      socket.on("show stats", (lobbyId) => {
        //we need to update stats first
        const playerStats = lobbies[lobbyId]?.players.find(
          (player) => player.id === socket.id
        )?.stats;

        playerStats.pairsFound = playerStats.pairsFound + 1 || 1;
        playerStats.currMostInRow = playerStats.currMostInRow + 1 || 1;

        playerStats.mostInRow =
          playerStats.currMostInRow || playerStats.mostInRow || 1;

        //and then display them
        io.in(lobbyId).emit("show stats", lobbies[lobbyId]?.players);
      });

      socket.on("leave lobby", (lobbyId, autoLobbyDelete = false) => {
        const players = lobbies[lobbyId]?.players?.filter(
          (player) => player.id === socket.id
        );

        socket.to(lobbyId).emit("player left lobby", players);

        if (players?.length <= 0 || (players?.length <= 1 && autoLobbyDelete)) {
          socket.to(lobbyId).emit("delete lobby");
          io.socketsLeave(lobbyId);
        } else {
          socket.leave(lobbyId);
        }
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
