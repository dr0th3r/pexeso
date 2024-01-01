<script>
  import { fade } from "svelte/transition";

  import { userData } from "$lib/stores/userData.js";
  import defaultPacks from "../defaultPacks";

  import { authStore } from "$lib/stores/auth";

  import { db } from "../firebase/firebase.client";
  import { updateDoc, doc } from "firebase/firestore";

  import stateMachine from "$lib/stores/state.js";

  export let multiplayer = false;
  export let socket;
  export let lobbyInfo;

  let imgs = multiplayer
    ? lobbyInfo?.pack
    : $userData?.chosenPack?.imgUrls || defaultPacks[0]?.imgUrls;

  let playerOnTurn = null;

  const lobbyId = lobbyInfo?.id || null;
  $: players = lobbyInfo?.players || [];
  $: onTurn = checkIfOnTurn(players, lobbyInfo?.playerOnTurn, socket?.id); //am i on turn

  console.log(onTurn);

  socket?.on("flip card", (newFlippedCards) => {
    flippedCards = newFlippedCards;
  });

  socket?.on("card match", (newMatchedPairs) => {
    matchedPairs = newMatchedPairs;
  });

  socket?.on("player left game", (remainingPlayers) => {
    console.log(lobbyInfo);
    lobbyInfo.players = remainingPlayers;
    lobbyInfo = lobbyInfo;
    console.log(lobbyInfo);
  });
  
  socket?.on("next player", nextPlayer => {
    lobbyInfo.playerOnTurn = nextPlayer;
  });

  let flippedCards = [];
  let matchedPairs = [];

  $: columnCount = Math.ceil(Math.sqrt(imgs.length * 2));

  function flipCard(cardId) {
    socket?.emit("flip card", cardId);
  }

  function startGame() {
    flippedCards = [];
    matchedPairs = [];
  }

  function checkIfOnTurn(id) {
    return playerOnTurn == id;
  }

  startGame();
</script>

{#if multiplayer}
  <div class="player-list">
    {#each players as { name, id } (id)}
      <span
        style:border={checkIfOnTurn(id)
          ? "1px solid var(--primary)"
          : "none"}>{name}</span
      >
    {/each}
  </div>
{/if}
<div
  class="board"
  in:fade={{ duration: 500 }}
  style:grid-template-columns="repeat({columnCount}, min(calc(75vw / {columnCount}),
  calc(75vh / {columnCount})))"
>
  {#each Array(lobbyInfo?.pack.length * 2) as _, index (index)}
    {@const isFound = matchedPairs.includes(index)}
    {@const card = flippedCards.find(card => card.cardId == index) || null}
    {@const isFlipped = isFound || card != null}
    <button
      class:flipped={isFlipped}
      on:click={() => flipCard(index)}
    >
      <div class="img-container" class:found={isFound}>
        <img
          src={isFlipped && card != null ? card.imgUrl : "./never_gonna.jpg"}
          alt="card"
        />
      </div>
    </button>
  {/each}
</div>

<style>
  .player-list {
    position: absolute;
    top: -2.4rem;
    left: 0;
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    color: #f0f0f0;
    width: 100%;
  }

  .player-list span {
    box-sizing: border-box;
    font-size: 1.2rem;
    display: block;
    padding: 0.2rem 0.4rem;
    border-radius: 8px;
  }

  .board {
    display: grid;
    gap: 0.8rem;
  }

  @media (max-width: 600px) {
    .board {
      grid-template-columns: repeat(3, min(calc(75vw / 3), calc(75vh / 3)));
    }
  }

  button {
    cursor: pointer;
    border-radius: 12px;
    border: 2px solid var(--primary);
    background-color: var(--bg);
    rotate: y 0deg;
    transform-style: preserve-3d;
    transition: all 0.3s ease-out;
    aspect-ratio: 1 / 1;
  }

  .flipped {
    rotate: y 180deg;
  }

  .flipped img {
    opacity: 1;
  }

  .found {
    opacity: 0.6;
    cursor: initial;
  }

  .img-container {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    backface-visibility: hidden;
    rotate: y 180deg;
  }

  img {
    opacity: 0; /*better performance than display: none*/
    object-fit: fill;
    overflow: hidden;
    height: 100%;
    width: 100%;
    border-radius: 8px;
    -webkit-user-drag: none;
    user-select: none;
    -webkit-user-select: none;
  }
</style>
