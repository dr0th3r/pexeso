<script>
  import { io } from "socket.io-client";

  const socket = io();

  socket.on("playerJoin", (playerId) => {
    playersInLobby = [...playersInLobby, playerId];
  });

  let wantsMultiplayer = false;
  let isInLobby = false;

  let lobbyId;
  let playersInLobby = [];

  function createGame() {
    console.log("creating game...");
    socket.emit("createGame", (err) => {
      console.log(err);
      isInLobby = false;
    });
    isInLobby = true;
    lobbyId = socket.id;
    playersInLobby = [socket.id];
  }

  function joinLobby() {
    if (!lobbyId) {
      alert("You must provide lobby id!");
      return;
    }

    socket.emit("joinLobby", lobbyId, (response) => {
      if (response?.status === 200) {
        playersInLobby = response?.players;
      }
    });

    isInLobby = true;
  }
</script>

{#if !wantsMultiplayer}
  <button type="button" disabled={true}>Singleplayer</button>
  <button type="button" on:click={() => (wantsMultiplayer = true)}
    >Multiplayer</button
  >
{:else if isInLobby}
  <h1>{lobbyId}</h1>
  <h3>Players:</h3>
  <ul>
    {#each playersInLobby as player}
      <li>{player}</li>
    {/each}
  </ul>
  {#if socket.id === lobbyId}
    <button>Start Game</button>
  {/if}
{:else}
  <button on:click={createGame}>Create Game</button>
  <input type="text" placeholder="Lobby id..." bind:value={lobbyId} />
  <button type="button" on:click={joinLobby}>Join Lobby</button>
{/if}

<style>
  button {
    cursor: pointer;
  }
</style>
