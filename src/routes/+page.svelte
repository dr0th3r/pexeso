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

<main class="outer" let:socket={socket}>
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
