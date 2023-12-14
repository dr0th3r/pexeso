<script>
  export let stats;
  export let startGame;

  $: console.log(stats);
</script>

<h1>Stats</h1>
{#each Object.keys(stats) as player}
  <h2>{player}</h2>
  <p>Points: {stats[player].points}</p>
{/each}
<button on:click={startGame}>Start New Game</button>
