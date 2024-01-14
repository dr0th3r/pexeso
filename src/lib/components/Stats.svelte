<script>
  import stateMachine from "$lib/stores/state";

  import { userData } from "$lib/stores/userData";

  import { socketStore } from "$lib/stores/socket";

  export let stats; //array of players
  export let multiplayer = false;
  export let lobbyId;

  $socketStore?.on("toggle ready", (playerId) => {
    const player = stats?.find((player) => player.id == playerId);
    player.ready = !player.ready;

    stats = stats; //for svelte to refresh
  });

  $socketStore?.on("player left lobby", (connectedPlayers) => {
    stats = connectedPlayers;
  });

  $: console.log(stats);
</script>

{#if !multiplayer}
  <h1>Your Statistics</h1>
  <ul>
    <li>
      Most pairs found in a row in all games: {$userData.mostFoundInRow}
    </li>
    <li>
      Least cards flipped per game: {$userData?.leastCardsFlipped}
    </li>
    <li>Games Played: {$userData.gamesPlayed}</li>
    <button on:click={() => stateMachine.emit({ type: "startSingleplayer" })}
      >Start New Game</button
    >
    <button on:click={() => stateMachine.emit({ type: "goToMainMenu" })}
      >Back To Menu</button
    >
  </ul>
{:else if stats}
  <div class="table-container">
    <table>
      <tr>
        <th>Player</th>
        <th>Games played</th>
        <th>Pairs found</th>
        <th>Most in row</th>
        <th>Least cards flipped</th>
        <th>Ready to continue</th>
      </tr>
      {#each stats as player}
        {@const stats = player?.stats}
        <tr>
          <td>{player?.name}</td>
          <td>{stats?.gamesPlayed}</td>
          <td>{stats?.pairsFound}</td>
          <td>{stats?.mostFoundInRow}</td>
          <td>{stats?.leastCardsFlipped}</td>
          <td style:color={player?.ready ? "var(--success)" : "var(--error)"}
            >{player?.ready ? "Ready" : "Not Ready"}</td
          >
        </tr>
      {/each}
    </table>
  </div>
  <div class="btns">
    <button on:click={() => $socketStore.emit("toggle ready", lobbyId)}
      >Ready</button
    >
    <button
      on:click={() => {
        $socketStore.emit("leave lobby", lobbyId, true);
      }}>Back To Menu</button
    >
  </div>
{/if}

<style>
  h1 {
    color: var(--text);
    font-size: 2.5rem;
  }

  ul {
    list-style-type: none;
  }

  li {
    text-align: center;
    color: var(--text);
    margin-bottom: 0.4rem;
  }

  button {
    width: clamp(250px, 10rem, 1000px);
    font-size: 1.1rem;
    padding: 1rem 2rem;
    margin-top: 0.6rem;
    margin-left: 0.4rem;
  }

  .btns {
    width: clamp(250px, 90vw, 600px);
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btns button {
    margin-left: 0;
    flex: 1 0 40%;
  }

  .table-container {
    box-sizing: border-box;
    width: clamp(
      250px,
      90vw,
      800px
    ); /* 600px for the table + 30 px for the padding*/
    overflow-x: auto;
    padding: 15px;
    display: flex;
    justify-content: center;
  }

  table {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-collapse: collapse;
  }

  th {
    font-size: 1.4rem;
    text-align: left;
  }

  td {
    font-size: 1.3rem;
  }

  @media (max-width: 600px) {
    table {
      width: 100%;
    }

    th {
      font-size: 1rem;
    }

    td {
      font-size: 0.9rem;
    }

    .btns button {
      padding: 0.5rem;
    }
  }

  th,
  td {
    padding: 1rem 1.2rem;
    color: var(--text);
  }

  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  tr:first-child td:first-child {
    border-radius: 8px 0 0 0;
  }

  tr:first-child td:last-child {
    border-radius: 0 8px 0 0;
  }

  tr:last-child td:first-child {
    border-radius: 0 0 0 8px;
  }

  tr:last-child td:last-child {
    border-radius: 0 0 8px 0;
  }
</style>
