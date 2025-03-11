import { ClientUser } from "../src/lib/types";
import Game from "./game";
import { Server, Socket } from "socket.io";
import { ViteDevServer } from 'vite';

const CARD_FLIP_DURATION = 1000;

export default {
  name: "webSocketServer",
  configureServer(server: ViteDevServer) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer);

    let games: Game[] = [];

    io.on("connection", (socket: Socket) => {
      let game: Game | null = null;

      socket.on("start singleplayer game", (player: ClientUser) => {
        game = new Game(socket.id, 
          player.packs.find(pack => pack.id === player.selectedPackId) || player.packs[0]);
        game.joinGame(player);
        game.startGame();

        io.to(socket.id).emit("game started", game.getInitialStats(), game.cards.length);
      }) 

      socket.on("flip card", (id: number) => {
        if (!game //if isn't game
          || game.flippedCards.length >= 2 //or cards are already flipped
          || game.flippedCards[0]?.id === id //or card is already flipped
          || socket.id !== game.players[game.playerOnTurn].socketId) return; //or it's not your turn

        const card = game.cards.find(card => card.id === id);
        
        game.flippedCards.push(card!);

        const playerStats = game.players[game.playerOnTurn].stats;

        playerStats.currCardsFlipped += 1;

        if (game.flippedCards.length === 2) {

          if (game.flippedCards[0].groupId === game.flippedCards[1].groupId) {
            game.matchedCards.push(game.flippedCards[0], game.flippedCards[1]);

            //updating stats

            playerStats.currCardsFoundInRow += 1;   
            if (playerStats.currCardsFoundInRow > playerStats.mostCardsFoundInRow) {
              playerStats.mostCardsFoundInRow = playerStats.currCardsFoundInRow;
            }

            if (game.matchedCards.length === game.cards.length) { //game ended
              //we need to parse it now because it relies on playerOnTurn
              const currStats = game.parseStats();
              game.running = false;
              game.playerOnTurn = 0;

              setTimeout(() => {
                game?.players.forEach(player => {
                  player.stats.leastCardsFlipped = Math.min(player.stats.leastCardsFlipped, player.stats.currCardsFlipped);
                  player.stats.bestTime = Math.min(player.stats.bestTime, player.stats.currTime);
                  player.stats.gamesPlayed++;
                })

                io.in(game!.id).emit("game ended", currStats);

              }, CARD_FLIP_DURATION)
            }

            setTimeout(() => {
              io.in(game!.id).emit("cards matched", [game!.flippedCards[0], game!.flippedCards[1]], game!.parseStats());
              game!.flippedCards = [];
            }, CARD_FLIP_DURATION)
          } else {
            if (!game) return;
            //we need to parse it now because it relies on playerOnTurn
            const currStats = game!.parseStats();

            setTimeout(() => {
              io.in(game!.id).emit("flip cards back", currStats);
              game!.flippedCards = [];
            }, CARD_FLIP_DURATION)

            game.players[game.playerOnTurn].stats.currCardsFoundInRow = 0;
            game.playerOnTurn = (game.playerOnTurn + 1) % game.players.length;
          }          
        }

        io.in(game!.id).emit("card flipped", card, game!.parseStats());
      })

      socket.on("create multiplayer game", (player: ClientUser) => {
        game = new Game(`${socket.id}${Math.floor(Math.random() * 100)}_lobby`, //still not 100% random but safe almost always
        player.packs.find(pack => pack.id === player.selectedPackId) || player.packs[0]);
        game.joinGame(player);

        io.in(game.id).emit("player joined", {
            id: player.socketId,
            name: player.name,
            ready: false
        });

        socket.join(game.id);

        const lobbyInfo = game.getLobbyInfo();

        socket.emit("game created", lobbyInfo);
      })

      socket.on("join multiplayer game", (player: ClientUser, gameId: string) => {
        game = games.find(game => game.id === gameId) || null;
        if (!game || game?.running) return; //add sending error to client later

        game.joinGame(player);

        socket.join(game.id);
        socket.emit("game joined", game.getLobbyInfo());
      });

      socket.on("toggle ready", () => {
        let readyCount = 0;

        game?.players.map(player => {
          if (player.ready) readyCount++;

          if (player.socketId === socket.id) {
            if (player.ready) {
              readyCount--;
            } else {
              readyCount++;
            }
            player.ready = !player.ready;
          }
          return player;
        })

        if (readyCount > 1 && readyCount === game?.players.length) {
          io.in(game!.id).emit("start game");
          game!.startGame();
          setTimeout(() => {
            io.in(game!.id).emit("game started", game!.getInitialStats(), game!.cards.length);
          }, 500) //there is transition ongoing
        }

        io.in(game!.id).emit("player ready", socket.id);
      })

      socket.on("send message", (msg: string) => {
        if (!game) return;

        const playerName = game.players.find(player => player.socketId === socket.id)?.name;

        if (!playerName) return;

        io.in(game.id).emit("message sent", { name: playerName, msg });
      })

      socket.on("leave game", (deleteOnOnePlayer: boolean) => {
        if (!game) return;

        game.leaveGame(socket.id);

        if (game.players.length === 0) {
          games = games.filter(g => g.id !== game!.id);

          io.in(game.id).emit("player left", socket.id); 
          socket.leave(game.id);
          game = null;
          return;
        } else if (deleteOnOnePlayer && game.players.length === 1) {
          games = games.filter(g => g.id !== game!.id);

          io.in(game.id).emit("game deleted");

          for (const player of game.players) {
            io.sockets.sockets.get(player.socketId)?.leave(game.id);
          }

          game.players = [];
          game = null;
          return;
        }

        io.in(game.id).emit("player left", socket.id);
      })

      socket.on("disconnect", () => {
        if (!game || game?.players?.length !== 0) return;

        io.in(game.id).emit("player left", socket.id);
        socket.leave(game.id);
        game = null;
      })
    })
  },
};