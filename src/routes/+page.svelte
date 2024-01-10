<script>
  import { fade, fly } from "svelte/transition";

  import stateMachine from "$lib/stores/state";
  const { state } = stateMachine;

  import SignIn from "../lib/components/SignIn.svelte";
  import MainMenu from "../lib/components/MainMenu.svelte";
  import Gameboard from "../lib/components/Gameboard.svelte";
  import Stats from "../lib/components/Stats.svelte";
  import CardMenu from "../lib/components/CardMenu.svelte";
  import LobbyMenu from "../lib/components/LobbyMenu.svelte";

  import { userData } from "$lib/stores/userData";
  import { authStore } from "$lib/stores/auth";
  import { io } from "socket.io-client";

  const socket = io();

  socket?.on("error", (err) => {
    alert(`Error: ${err}`);
  });

  socket?.on("start game", (data) => {
    lobbyInfo = data;
    stateMachine.emit({ type: "startMultiplayer" });

    console.log(lobbyInfo);
  });

  socket?.on("show stats", (players) => {
    lobbyInfo.players = players;
    lobbyInfo = lobbyInfo;
    stateMachine.emit({ type: "showStatistics" });

    console.log(lobbyInfo);
  });

  socket?.on("set stats", (stats) => {
    $userData.leastCardsFlipped = stats.leastCardsFlipped;
    $userData.gamesPlayed = stats.gamesPlayed;
    $userData.mostFoundInRow = stats.mostFoundInRow;
  });

  socket.on("delete lobby", () => {
    lobbyInfo = null;
    stateMachine.emit({ type: "goToMainMenu" });
  });

  socket.on("you left lobby", () => {
    lobbyInfo = null;
    stateMachine.emit({ type: "goToMainMenu" });
  });  

  let lobbyInfo = null;

  let transitionComplete = false;

  $: if ($state !== "inMainMenu") {
    transitionComplete = false;
    setTimeout(() => {
      transitionComplete = true;
    }, 500);
  } else {
    transitionComplete = false;
  }
</script>

<main class="outer">
  {#if $state === "inMainMenu"}
    <MainMenu />
  {:else if $state === "playingSingleplayer" && transitionComplete}
    <Gameboard 
    {socket}/>
  {:else if $state === "playingMultiplayer" && transitionComplete}
    <Gameboard
      multiplayer={true}
      {socket}
      {lobbyInfo}
    />
  {:else if $state === "inLobbyMenu" && transitionComplete}
    <LobbyMenu {socket} />
  {:else if $state === "inStatistics" && lobbyInfo}
    <Stats
      stats={lobbyInfo?.players}
      multiplayer={true}
      {socket}
      lobbyId={lobbyInfo?.id}
    />
  {:else if $state === "inStatistics"}
    <Stats />
  {:else if $state === "inCardMenu" && transitionComplete}
    <CardMenu />
  {:else if $state === "inSignInMenu" && transitionComplete}
    <SignIn />
  {/if}
</main>

<style>
  :global(body) {
    height: 100vh;
  }

  .outer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    position: relative;
  }
</style>
