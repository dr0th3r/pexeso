<script>
  import stateMachine from "$lib/stores/state.js";

  export let playerStats;
</script>

<h1>Your Statistics</h1>
<ul>
  <li>
    Most pairs found in a row this game: {playerStats.currentlyMostFoundInRow}
  </li>
  <li>
    Most pairs found in a row completely: {playerStats.totalyMostFoundInRow}
  </li>
  <li>Games Played: {playerStats.gamesPlayed}</li>
  <button on:click={() => stateMachine.emit({ type: "startSingleplayer" })}
    >Start New Game</button
  >
  <button on:click={() => stateMachine.emit({ type: "goToMainMenu" })}
    >Back To Menu</button
  >
</ul>

<style>
  h1 {
    color: #f0f0f0;
    font-size: 2.5rem;
  }

  ul {
    list-style-type: none;
  }

  li {
    text-align: center;
    color: #f0f0f0;
    margin-bottom: 0.4rem;
  }

  button {
    width: clamp(250px, 10rem, 1000px);
    font-size: 1.1rem;
    padding: 1rem 2rem;
    border-radius: 8px;
    border: 1px solid var(--primary);
    background-color: transparent;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease-out;
    margin-top: 0.6rem;
    margin-left: 0.4rem;
  }

  button:hover {
    background-color: var(--primary);
  }
</style>
