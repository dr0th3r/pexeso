<script>
  import stateMachine from "../stores/state";

  export let imgs;

  export let socket;

  socket.on("create lobby", (data) => {
    lobbyInfo = data;
    localState = "inLobby";
  });

  socket.on("join lobby", (data) => {
    lobbyInfo = data;
    localState = "inLobby";
  });

  socket.on("toggle ready", (playerId) => {
    const player = lobbyInfo?.players.find((player) => player.id == playerId);

    console.log(player);

    player.ready = !player.ready;
    lobbyInfo = lobbyInfo; //for svelte to refresh
  });

  let localState = "main";
  let lobbyInfo = null;

  let username = "";
  let joinLobbyId = "";

  function createLobby() {
    if (username === "") {
      alert("You must provide a username!");
      return;
    } else if (imgs.length < 2) {
      alert("Invalid pexeso pack!");
    }

    socket.emit("create lobby", username, imgs);
  }

  function joinLobby() {
    if (username === "") {
      alert("You must provide a username!");
      return;
    } else if (joinLobbyId === "") {
      alert("You must provide an id of the lobby you want to join!");
      return;
    }

    socket.emit("join lobby", username, joinLobbyId);
  }
</script>

{#if localState === "main"}
  <header>
    <h2>Lobby Menu</h2>
    <button class="home-btn" on:click={() => stateMachine.emit({type: "goToMainMenu"})}>Go To Main Menu</button>
  </header>
  <div class="cards">
    <button class="card" on:click={() => (localState = "createMenu")}
      >Create Lobby</button
    >
    <button class="card" on:click={() => (localState = "joinMenu")}
      >Join Lobby</button
    >
  </div>
{:else if localState == "createMenu"}
  <input placeholder="Username..." bind:value={username} />
  <button on:click={createLobby} class="create-join-btn">Create</button>
  <button class="create-join-btn" on:click={() => (localState = "main")}>Go Back</button>
{:else if localState == "joinMenu"}
  <input placeholder="Username..." bind:value={username} />
  <input placeholder="Lobby Id..." bind:value={joinLobbyId} />
  <button on:click={joinLobby} class="create-join-btn">Join</button>
  <button class="create-join-btn" on:click={() => (localState = "main")}>Go Back</button>
{:else if localState == "inLobby" && lobbyInfo}
  <div class="lobby">
    <h2>Lobby: {lobbyInfo?.id}</h2>
    <h3>Players</h3>
    <ul>
      {#each lobbyInfo?.players as player}
        <li>
          <span>
            {player.name}
          </span>
          <span style:color={player?.ready ? "var(--success)" : "var(--error)"}>
            {player?.ready ? "Ready" : "Not Ready"}
          </span>
        </li>
      {/each}
    </ul>
    <button on:click={() => {
      socket.emit("toggle ready", lobbyInfo?.id)
      localState="main"
    }}>Ready</button
    >
    <button on:click={() => socket.emit("leave lobby", lobbyInfo?.id)}
      >Leave</button
    >
  </div>
{/if}

<style>
  h2,
  h3 {
    color: #f0f0f0;
  }

  header,
  .cards {
    display: flex;
    align-items: flex-end;
    gap: 0.8rem;
    color: #f0f0f0;
    justify-content: space-between;
    width: calc(30vw);
  }

  button {
    padding: 0.5rem;
    color: #f0f0f0;
    background-color: transparent;
    border-radius: 8px;
    border: 1px solid var(--primary);
    cursor: pointer;
    font-size: 1.1rem;
  }

  .card {
    width: calc(100% / 2 + 0.8rem);
    font-size: 2rem;
    cursor: pointer;
    background-color: transparent;
    color: #f0f0f0;
    border: 1px solid var(--primary);
    border-radius: 8px;
    aspect-ratio: 1 / 1;
  }

  .home-btn,
  .create-join-btn,
  .card {
    transition: all 0.3s ease-out;
  }

  .home-btn:hover,
  .create-join-btn:hover,
  .card:hover {
    background-color: var(--primary);
  }

  input {
    box-sizing: border-box;
    padding: 0.5rem;
    font-size: 1.1rem;
    border: 1px solid var(--primary);
    outline: none;
    border-radius: 8px;
    background-color: transparent;
    color: #f0f0f0;
    width: 100%;
  }

  .create-join-btn {
    width: 100%;
  }

  h3 {
    margin-top: 0.6rem;
  }

  ul {
    margin-top: 0.4rem;
    list-style-type: none;
    color: #f0f0f0;
  }

  li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }
</style>
