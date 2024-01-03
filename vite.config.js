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
        if(++this.playerOnTurn >= this.players.length)
          this.playerOnTurn = 0;

        this.in().emit("next player", this.playerOnTurn);
      }

      removePlayer(playerId) {
        this.players = this.players.filter(
          player => player?.id !== playerId
        );
      }

      resetFlippedCards() {
        setTimeout(() => {
          this.in().emit("reset flipped cards");
          this.flippedCards = [];
        }, 1000);
      }

      cardMatch(playerId) {     
        const playerStats = this.players.find(
          player => player.id === playerId
        )?.stats;

        playerStats.pairsFound = playerStats.pairsFound + 1 || 1;
        playerStats.currMostInRow = playerStats.currMostInRow + 1 || 1;

        playerStats.mostInRow =
          playerStats.currMostInRow || playerStats.mostInRow || 1;

        this.in().emit("card match", this.flippedCards);

        this.matchedCards.push(this.flippedCards[0]);
        this.matchedCards.push(this.flippedCards[1]); // maybe use some built-in funciton

        this.resetFlippedCards();
      }

      endGame() {
        this.in().emit("show stats", this.players);

        this.matchedCards = [];
        this.flippedCards = [];
      }

      generateCards() {
        this.cards = createCards(this.pack);
      }
    }
    
    const lobbies = {};

    io.on("connection", (socket) => {
      let lobby = null;

      socket.on("create lobby", (username, pack) => {
        if(lobby != null)
          return;
      
        let lobbyId = `${socket.id}_lobby`;

        lobbies[lobbyId] = new Lobby(lobbyId, pack);
        lobby = lobbies[lobbyId];

        joinGame(lobby, username);
        socket.emit("lobby info", lobby.serialize());
      });

      socket.on("join lobby", (username, lobbyId) => {
        if(lobby != null)
          return;

        if (!lobbies[lobbyId]) {
          socket.emit("error", "No such lobby");
        } else if (lobbies[lobbyId]?.running) {
          console.log("user attempted to join running lobby");
          socket.emit("error", "You attempted to join running lobby");
        } else {
          lobby = lobbies[lobbyId];
          
          joinGame(lobby, username);
          socket.emit("lobby info", lobby.serialize());
          lobby.in().emit("join lobby", lobby.players);
        }
      });

      socket.on("toggle ready", () => { 
        if(lobby == null)
          return;
      
        const players = lobby.players;

        const player = players?.find((player) => player.id === socket.id);

        player.ready = !player.ready;

        lobby.in().emit("toggle ready", socket.id);

        if (!players.find(player => !player.ready)) {
          players.forEach(player => player.ready = false);
          lobby.playerOnTurn = 0;
          lobby.running = true;
          lobby.generateCards();
          lobby.in().emit("start game", lobby.serialize());
        }
      });

      socket.on("chat", message => {
        if(lobby == null)
          return;

        lobby.in().emit("chat", message);
      });

      socket.on("flip card", index => {
        if(lobby == null)
          return;

        if(lobby.players[lobby.playerOnTurn]?.id != socket.id)
          return;

        // Cards already visible
        if(lobby.flippedCards.find(e => e.cardId == index) 
        || lobby.matchedCards.find(e => e.cardId == index))
          return;

        const card = lobby.cards.find(e => e.cardId == index);
        lobby.flippedCards.push(card);
        lobby.in().emit("flip card", card);

        if(lobby.flippedCards.length == 2) {
          if(!lobby.flippedCards.find(e => e.groupId != card.groupId)) {
            lobby.cardMatch(socket.id);
            if(lobby.matchedCards.length == lobby.cards.length) {
              lobby.endGame();
            }
            return;
          }

          lobby.resetFlippedCards();
          lobby.nextPlayer();
        }
      });

      socket.on("show stats", () => {  
        if(lobby == null)
          return;
      
        //we need to update stats first
        const playerStats = lobby.players.find(
          (player) => player.id === socket.id
        )?.stats;

        playerStats.pairsFound = playerStats.pairsFound + 1 || 1;
        playerStats.currMostInRow = playerStats.currMostInRow + 1 || 1;

        playerStats.mostInRow =
          playerStats.currMostInRow || playerStats.mostInRow || 1;

        //and then display them
        lobby.in().emit("show stats", lobby.players);
      });

      socket.on("leave lobby", (autoLobbyDelete = false) => {
        if(lobby == null)
          return;

        const players = lobby?.players?.filter(
          (player) => player.id !== socket.id
        ) || [];

        lobby.players = players;

        lobby.in().emit("player left lobby", players);

        io.in(socket.id).emit("you left lobby");

        if (players?.length <= 0 || (players?.length <= 1 && autoLobbyDelete)) {
          socket.to(lobby.id).emit("delete lobby");
          io.socketsLeave(lobby.id);
        } else {
          socket.leave(lobby.id);
        }
      });

      socket.on("disconnect", () => {
        if (lobby !== null) {
          const lobbyId = lobby.id;

          if (lobby.players[lobby.playerOnTurn]?.id === socket?.id) {
            //if the disconnected player was on turn, we don't want any cards to remain flipped
            lobby.in().emit("reset flipped cards");
          }

          lobby.removePlayer(socket.id);

          if (lobby.players.length <= 1) {
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

      function joinGame(lobby, username) {
        lobby.players.push({
          id: socket.id,
          name: username,
          ready: false,
          stats: {
            pairsFound: 0,
            mostInRow: 0,
            currMostInRow: 0,
          },
        });

        socket.join(lobby.id);
      }
    
    });
  },
};

function createCards(imgUrls) {
  const cards = [];
  const ids = Array.from(Array(imgUrls.length * 2),(x,i)=>i);
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
