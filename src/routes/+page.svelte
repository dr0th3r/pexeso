<script>
  import { io } from "socket.io-client";

  const socket = io();

  let stats = {};

  socket.on("showStats", (newStats) => {
    stats = newStats;
    state = "showingStats";
  });

  import Game from "$lib/components/Game.svelte";
  import Menu from "$lib/components/Menu.svelte";
  import Stats from "$lib/components/Stats.svelte";

  let state = "inMenu";
  let lobbyId;

  socket.on("startGame", () => {
    state = "inGame";
  });

  function startGame() {
    socket.emit("gameStart", lobbyId);
    state = "inGame";
  }
</script>

{#if state === "inMenu"}
  <Menu {startGame} updateLobbyId={(newId) => (lobbyId = newId)} {socket} />
{:else if state === "showingStats"}
  <Stats {stats} {startGame} />
{:else}
  <Game {socket} {lobbyId} />
{/if}
