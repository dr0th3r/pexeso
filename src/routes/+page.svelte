<script>
  import { fade, fly } from "svelte/transition";

  import stateMachine from "$lib/stores/state.js";
  const { state } = stateMachine;

  import MainMenu from "../lib/components/MainMenu.svelte";
  import Gameboard from "../lib/components/Gameboard.svelte";
  import Stats from "../lib/components/Stats.svelte";
  import CardMenu from "../lib/components/CardMenu.svelte";

  let playerStats = {
    currentlyMostFoundInRow: 0, //in last game
    totalyMostFoundInRow: 0, //all time
    gamesPlayed: 0,
  };

  function updateStats(newStats) {
    const currInRow = newStats.mostFoundInRow;
    const totalInRow = playerStats.totalyMostFoundInRow;

    playerStats = {
      currentlyMostFoundInRow: currInRow,
      totalyMostFoundInRow: totalInRow > currInRow ? totalInRow : currInRow,
      gamesPlayed: playerStats.gamesPlayed + 1,
    };
  }

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
    <Gameboard {updateStats} />
  {:else if $state === "inStatistics"}
    <Stats {playerStats} />
  {:else if $state === "inCardMenu" && transitionComplete}
    <CardMenu />
  {/if}
</main>

<style>
  :global(body) {
    height: 100vh;
  }

  .outer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
  }
</style>
