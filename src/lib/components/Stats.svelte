<script>
  import stateMachine from "$lib/stores/state";

  import { userData } from "$lib/stores/userData";

  export let stats; //array of players
  export let multiplayer = false;
  export let socket;
  export let lobbyId;

  socket?.on("toggle ready", (playerId) => {
    const player = stats?.find((player) => player.id == playerId);
    player.ready = !player.ready;

    stats = stats; //for svelte to refresh
  });

  socket?.on("player left lobby", (connectedPlayers) => {
    stats = connectedPlayers;
  });
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
        <th>Pairs found</th>
        <th>Most in row</th>
        <th>Ready to continue</th>
      </tr>
      {#each stats as player}
        <tr>
          <td>{player?.name}</td>
          <td>{player?.stats?.pairsFound}</td>
          <td>{player?.stats?.mostInRow}</td>
          <td style:color={player?.ready ? "var(--success)" : "var(--error)"}
            >{player?.ready ? "Ready" : "Not Ready"}</td
          >
        </tr>
      {/each}
    </table>
  </div>
  <div class="btns">
    <button on:click={() => socket.emit("toggle ready", lobbyId)}>Ready</button>
    <button
      on:click={() => {
        socket.emit("leave lobby", lobbyId, true);
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
      630px
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
