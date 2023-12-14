import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

const webSocketServer = {
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
};

export default defineConfig({
  plugins: [sveltekit(), webSocketServer],
});
