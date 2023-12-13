import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import { Server } from "socket.io";

const webSocketServer = {
  name: "webSocketServer",
  configureServer(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    io.on("connection", (socket) => {
      socket.emit("eventFromServer", "Hello, World 👋");

      socket.on("createGame", () => {
        socket.join(socket.id);
      });

      socket.on("joinLobby", (lobbyId, callback) => {
        socket.join(lobbyId);

        socket.to(lobbyId).emit("playerJoin", socket.id);

        const playersInLobby = Array.from(
          io.sockets.adapter.rooms.get(lobbyId)
        );

        console.log(playersInLobby);

        callback({
          status: 200,
          players: playersInLobby,
        });
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
