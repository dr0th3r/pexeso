<script lang="ts">
  import { authStore } from "../stores/auth";

  import { userData } from "../stores/userData";

  import defaultPacks from "$lib/defaultPacks";

  import stateMachine from "../stores/state";
  import { fade } from "svelte/transition";

  import { socketStore } from "$lib/stores/socket";
  import type { LobbyInfo } from "$lib/types";

  let localState = "main";
  let lobbyInfo: LobbyInfo = null;

  $: if (lobbyInfo === null) {
    localState = "main";
  }

  let imgs = $userData?.chosenPack?.imgUrls || defaultPacks[0]?.imgUrls;

  $socketStore?.on("lobby info", (data) => {
    lobbyInfo = data;
    localState = "inLobby";
  });

  $socketStore?.on("join lobby", (players) => {
    if (!lobbyInfo) return;

    lobbyInfo.players = players;
    localState = "inLobby";
  });

  $socketStore?.on("player left lobby", (connectedPlayers) => {
    if (!lobbyInfo) return;

    lobbyInfo.players = connectedPlayers;
    lobbyInfo = lobbyInfo;
  });

  $socketStore?.on("toggle ready", (playerId) => {
    const player = lobbyInfo?.players.find((player) => player.id == playerId);

    if (!player) {
      return;
    }

    player.ready = !player.ready;
    lobbyInfo = lobbyInfo; //for svelte to refresh
  });

  let username = "";
  let joinLobbyId = "";

  $: if ($authStore.user) {
    username = $userData.displayName;
  }

  let showCoppiedTooltip = false;

  function createLobby() {
    if (username === "") {
      alert("You must provide a username!");
      return;
    } else if (imgs.length < 2) {
      alert("Invalid pexeso pack!");
    }

    $socketStore?.emit("create lobby", username, false, imgs);
  }

  function joinLobby() {
    if (username === "") {
      alert("You must provide a username!");
      return;
    } else if (joinLobbyId === "") {
      alert("You must provide an id of the lobby you want to join!");
      return;
    }

    $socketStore?.emit("join lobby", username, joinLobbyId);
  }

  function leaveLobby() {
    $socketStore?.emit("leave lobby", lobbyInfo?.id, false);
    localState = "main";
  }

  let transitionComplete = true;
  let isFirstTransition = true;

  $: if (localState && !isFirstTransition) {
    transitionComplete = false;
    setTimeout(() => {
      transitionComplete = true;
    }, 500);
  } else if (localState && isFirstTransition) {
    isFirstTransition = false;
  }
</script>

{#if localState === "main" && transitionComplete}
  <div class="container" transition:fade={{ duration: 300 }}>
    <header>
      <h2>Lobby Menu</h2>
      <button
        class="home-btn"
        on:click={() => stateMachine.emit({ type: "goToMainMenu" })}
        >Go To Main Menu</button
      >
    </header>
    <div class="cards">
      <button class="card" on:click={() => (localState = "createMenu")}
        >Create Lobby</button
      >
      <button class="card" on:click={() => (localState = "joinMenu")}
        >Join Lobby</button
      >
    </div>
  </div>
{:else if localState == "createMenu" && transitionComplete}
  <div class="container" transition:fade={{ duration: 300 }}>
    <input placeholder="Username..." bind:value={username} />
    <button on:click={createLobby} class="create-join-btn">Create</button>
    <button class="create-join-btn" on:click={() => (localState = "main")}
      >Go Back</button
    >
  </div>
{:else if localState == "joinMenu" && transitionComplete}
  <div class="container" transition:fade={{ duration: 300 }}>
    <input placeholder="Username..." bind:value={username} />
    <input placeholder="Lobby Id..." bind:value={joinLobbyId} />
    <button on:click={joinLobby} class="create-join-btn">Join</button>
    <button class="create-join-btn" on:click={() => (localState = "main")}
      >Go Back</button
    >
  </div>
{:else if localState == "inLobby" && lobbyInfo && transitionComplete}
  <div class="lobby" transition:fade={{ duration: 300 }}>
    <h2>
      Lobby:&nbsp;
      <span class="lobby-id">{lobbyInfo?.id}</span>
      <span class="copy-span">
        <button
          class="copy-btn"
          on:click={() => {
            navigator.clipboard.writeText(lobbyInfo?.id || "");
            showCoppiedTooltip = true;
            setTimeout(() => {
              showCoppiedTooltip = false;
            }, 1000);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M15.24 2h-3.894c-1.764 0-3.162 0-4.255.148c-1.126.152-2.037.472-2.755 1.193c-.719.721-1.038 1.636-1.189 2.766C3 7.205 3 8.608 3 10.379v5.838c0 1.508.92 2.8 2.227 3.342c-.067-.91-.067-2.185-.067-3.247v-5.01c0-1.281 0-2.386.118-3.27c.127-.948.413-1.856 1.147-2.593c.734-.737 1.639-1.024 2.583-1.152c.88-.118 1.98-.118 3.257-.118h3.07c1.276 0 2.374 0 3.255.118A3.601 3.601 0 0 0 15.24 2"
            /><path
              fill="currentColor"
              d="M6.6 11.397c0-2.726 0-4.089.844-4.936c.843-.847 2.2-.847 4.916-.847h2.88c2.715 0 4.073 0 4.917.847c.843.847.843 2.21.843 4.936v4.82c0 2.726 0 4.089-.843 4.936c-.844.847-2.202.847-4.917.847h-2.88c-2.715 0-4.073 0-4.916-.847c-.844-.847-.844-2.21-.844-4.936z"
            /></svg
          >
          {#if showCoppiedTooltip}
            <span
              class="tooltip tooltip-coppied"
              in:fade={{ duration: 250 }}
              out:fade={{ duration: 250 }}>Successfully coppied</span
            >
          {:else}
            <span class="tooltip" in:fade={{ duration: 250 }}
              >Copy to clipboard</span
            >
          {/if}
        </button>
      </span>
    </h2>
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
    <button
      on:click={() => {
        $socketStore?.emit("toggle ready", lobbyInfo?.id);
      }}>Ready</button
    >
    <button on:click={leaveLobby}>Leave</button>
  </div>
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    height: 100%;
  }

  h2,
  h3 {
    color: var(--text);
  }

  header,
  .cards {
    display: flex;
    align-items: flex-end;
    gap: 0.8rem;
    color: var(--text);
    justify-content: space-between;
    width: clamp(200px, 80vw, 600px);
  }

  button {
    padding: 0.5rem;
    font-size: 1.1rem;
  }

  .card {
    width: calc(100% / 2 + 0.8rem);
    font-size: 2rem;
    cursor: pointer;
    background-color: transparent;
    color: var(--text);
    border: 1px solid var(--primary);
    border-radius: 8px;
    aspect-ratio: 1 / 1;
  }

  h2,
  .home-btn {
    text-wrap: nowrap;
  }

  @media (max-width: 600px) {
    h2 {
      font-size: 1.4rem;
    }

    header {
      display: flex;
      align-items: center;
    }
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
    color: var(--text);
  }

  input,
  .create-join-btn {
    width: clamp(200px, 80vw, 350px);
  }

  .lobby {
    width: clamp(200px, 80vw, 600px);
  }

  .lobby-id {
    text-wrap: nowrap;
  }

  h2 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
  }

  .copy-span {
    margin-left: auto;
  }

  .copy-btn {
    padding: 0.4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease-out;
    position: relative;
  }

  @media (max-width: 600px) {
    .lobby-id {
      font-size: 1rem;
    }

    svg {
      width: 0.8rem;
      height: 0.8rem;
    }
  }

  .tooltip {
    width: 200px;
    padding: 5px 10px;
    bottom: 150%;
    margin-left: -110px;
  }

  .tooltip-coppied {
    visibility: visible;
    background-color: var(--success);
  }

  .tooltip-coppied:after {
    border-color: var(--success) transparent transparent transparent;
  }

  button:hover .tooltip {
    visibility: visible;
  }

  .copy-btn:hover {
    background-color: var(--primary);
  }

  h3 {
    margin-top: 0.6rem;
  }

  ul {
    margin-top: 0.4rem;
    list-style-type: none;
    color: var(--text);
  }

  li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }
</style>
