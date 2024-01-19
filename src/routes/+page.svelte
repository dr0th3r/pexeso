<script lang="ts">
  import { fade, fly } from "svelte/transition";

  import stateMachine from "$lib/stores/state";
  const { state } = stateMachine;

  import SignIn from "$lib/components/SignIn.svelte";
  import MainMenu from "$lib/components/MainMenu.svelte";
  import Gameboard from "$lib/components/Gameboard.svelte";
  import Stats from "$lib/components/Stats.svelte";
  import CardMenu from "$lib/components/CardMenu.svelte";
  import LobbyMenu from "$lib/components/LobbyMenu.svelte";

  import { userData } from "$lib/stores/userData";
  import { socketStore } from "$lib/stores/socket";
  import { updateDoc, doc } from "firebase/firestore";

  import { authStore } from "$lib/stores/auth";
  import { db } from "$lib/firebase/firebase.client";
  import Leaderboards from "../lib/components/Leaderboards.svelte";

  import type { LobbyInfo } from "$lib/types";

  let lobbyInfo: LobbyInfo = null;

  $socketStore?.on("error", (err) => {
    alert(`Error: ${err}`);
  });

  $socketStore?.on("start game", (data) => {
    console.log(data);

    lobbyInfo = data;
    stateMachine.emit({ type: "startMultiplayer" });

    console.log(lobbyInfo);
  });

  $socketStore?.on("show stats", (players) => {
    if (!lobbyInfo) return;

    lobbyInfo.players = players;
    lobbyInfo = lobbyInfo;
    stateMachine.emit({ type: "showStatistics" });

    console.log(lobbyInfo);
  });

  $socketStore?.on("delete lobby", () => {
    if (!lobbyInfo) return;

    lobbyInfo = null;
    stateMachine.emit({ type: "goToMainMenu" });
  });

  $socketStore?.on("you left lobby", () => {
    if (!lobbyInfo) return;

    lobbyInfo = null;
    stateMachine.emit({ type: "goToMainMenu" });
  });

  $socketStore?.on("set stats", async (stats) => {
    console.log(stats);

    $userData.leastCardsFlipped = stats.leastCardsFlipped;
    $userData.gamesPlayed = stats.gamesPlayed;
    $userData.mostFoundInRow = stats.mostFoundInRow;
    $userData.mostPairsFound = stats.mostPairsFound;
    try {
      console.log(stats);
      await updateDoc(doc(db, "users", $authStore.user.uid), {
        gamesPlayed: stats.gamesPlayed,
        leastCardsFlipped: stats.leastCardsFlipped,
        mostFoundInRow: stats.mostFoundInRow,
        mostPairsFound: stats.mostPairsFound,
      });
    } catch (error) {
      console.log(error);
    }
  });

  let transitionComplete = true;

  $: if ($state) {
    transitionComplete = false;
    setTimeout(() => {
      transitionComplete = true;
    }, 500);
  }
</script>

{#if $state === "inMainMenu" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <MainMenu />
  </div>
{:else if $state === "playingSingleplayer" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <Gameboard lobbyInfo={null} />
  </div>
{:else if $state === "playingMultiplayer" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <Gameboard multiplayer={true} {lobbyInfo} />
  </div>
{:else if $state === "inLobbyMenu" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <LobbyMenu />
  </div>
{:else if $state === "inStatistics" && lobbyInfo}
  <div transition:fade={{ duration: 300 }}>
    <Stats
      stats={lobbyInfo?.players}
      multiplayer={true}
      lobbyId={lobbyInfo?.id}
    />
  </div>
{:else if $state === "inCardMenu" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <CardMenu />
  </div>
{:else if $state === "inSignInMenu" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <SignIn />
  </div>
{:else if $state === "inLeaderboards" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <Leaderboards />
  </div>
{/if}

<style>
  :global(body) {
    height: 100vh;
  }

  div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    position: relative;
  }
</style>
