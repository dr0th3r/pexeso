<script>
  import { fade } from "svelte/transition";

  import { userData } from "$lib/stores/userData";
  import defaultPacks from "../defaultPacks";

  import { socketStore } from "$lib/stores/socket";

  export let multiplayer = false;
  export let lobbyInfo;

  let imgs = multiplayer
    ? lobbyInfo?.pack
    : $userData?.chosenPack?.imgUrls || defaultPacks[0]?.imgUrls;

  let playerOnTurn = 0;

  const lobbyId = lobbyInfo?.id || null;
  $: players = lobbyInfo?.players || [];

  if (!multiplayer) {
    $socketStore?.emit("create lobby", $userData.displayName, true, imgs);
  }

  $socketStore?.on("flip card", (card) => {
    console.log(card);
    flippedCards.push(card);
    flippedCards = flippedCards;
  });

  $socketStore?.on("card match", (newMatchedPairs) => {
    matchedPairs.push(newMatchedPairs[0]);
    matchedPairs.push(newMatchedPairs[1]);
    console.log(newMatchedPairs);
    matchedPairs = matchedPairs;
  });

  $socketStore?.on("reset flipped cards", () => {
    flippedCards = [];
  });

  $socketStore?.on("player left game", (remainingPlayers) => {
    lobbyInfo.players = remainingPlayers;
    lobbyInfo = lobbyInfo;
  });

  $socketStore?.on("next player", (nextPlayer) => {
    playerOnTurn = nextPlayer;
    lobbyInfo = lobbyInfo;
  });

  let flippedCards = [];
  let matchedPairs = [];

  $: columnCount = Math.ceil(Math.sqrt(imgs.length * 2));

  function flipCard(cardId) {
    $socketStore?.emit("flip card", cardId);
  }

  function startGame() {
    flippedCards = [];
    matchedPairs = [];
  }

  function checkIfOnTurn(id) {
    return lobbyInfo.players[playerOnTurn].id == id;
  }

  startGame();
  $socketStore?.emit("set stats", $userData);
</script>

{#if multiplayer}
  <div class="player-list">
    {#each players as { name, id } (id)}
      <span
        style:border={checkIfOnTurn(id) ? "1px solid var(--primary)" : "none"}
        >{name}</span
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
  {#each Array((lobbyInfo?.pack?.length || 0) * 2) as _, index (index)}
    {@const matchedCard = matchedPairs.find((e) => e.cardId == index) || null}
    {@const flippedCard = flippedCards.find((e) => e.cardId == index) || null}
    {@const isFlipped = matchedCard != null || flippedCard != null}
    {@const card = matchedCard == null ? flippedCard : matchedCard}
    <button class:flipped={isFlipped} on:click={() => flipCard(index)}>
      <div class="img-container" class:found={matchedCard != null}>
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
    color: var(--text);
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
    border-width: 2px;
    rotate: y 0deg;
    transform-style: preserve-3d;
    aspect-ratio: 1 / 1;
  }

  button:hover {
    background-color: transparent;
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
