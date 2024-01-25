<script lang="ts">
  import state from "$lib/stores/state";

  import gameStats from "$lib/stores/gameStats";

  import userData from "$lib/stores/userData";

  let readyPlayers = Object.keys($gameStats).reduce((acc, curr) => {
    acc[curr] = false
    
    return acc;
  }, {} as {
    [key: string]: boolean
  })

  $socketStore?.on("player ready", (playerId: string) => {
    readyPlayers[playerId] = !readyPlayers[playerId];
  })

  $socketStore?.on("player left", (playerId: string) => {
    delete $gameStats[playerId];
    delete readyPlayers[playerId];
  })

  import { socketStore } from "$lib/stores/socket";
</script>
<div class="stats-container">
  <div class="table-container">
    <table>
      <tr>
        <th>Player</th>
        <th>Cards flipped</th>
        <th>Most in row</th>
        <th>Currently in row</th>
        <th>Time</th>
        <th>Ready</th>
      </tr>
      {#each Object.entries($gameStats) as [playerId, playerStats]}
        {@const isPlayerReady = readyPlayers[playerId]}
        <tr>
          <td>{playerStats.name}</td>
          <td>{playerStats.currCardsFlipped}</td>
          <td>{playerStats.mostCardsFoundInRow}</td>
          <td>{playerStats.currCardsFoundInRow}</td>
          <td>{playerStats.currTime}</td>
          <td style:color={isPlayerReady ? "var(--success)" : "var(--error)"}>{isPlayerReady}</td>
        </tr>
      {/each}
    </table>
  </div>
  <div class="btns">
    <button on:click={() => {
      if (Object.keys($gameStats).length === 1) {
        state.emit({ type: "start singleplayer"});
      } else {
        $socketStore?.emit("toggle ready")
    }}}
      >Ready</button
    >
    <button
      on:click={() => {
        state.emit({ type: "go to main menu" })
      }}>Back To Menu</button
    >
  </div>
</div>

<style>
  .stats-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

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
