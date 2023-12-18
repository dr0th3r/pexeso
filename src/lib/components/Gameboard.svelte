<script>
  import { fade } from "svelte/transition";

  import stateMachine from "$lib/stores/state.js";

  export let imgs;
  export let updateStats;

  export let multiplayer = false;
  export let socket;
  export let lobbyInfo;

  const lobbyId = lobbyInfo?.id || null;
  const players = lobbyInfo?.players;
  $: onTurn = checkIfOnTurn(players, lobbyInfo?.playerOnTurn, socket?.id); //am i on turn

  console.log(onTurn);

  socket?.on("flip card", (newFlippedCards) => {
    flippedCards = newFlippedCards;
  });

  socket?.on("card match", (newMatchedPairs) => {
    matchedPairs = newMatchedPairs;
  });

  let localStats = {
    foundInRow: 0,
    mostFoundInRow: 0,
  };

  let cards = [];
  let flippedCards = [];
  let matchedPairs = [];

  $: columnCount = Math.ceil(Math.sqrt(imgs.length * 2));

  function checkIfOnTurn(players, playerOnTurn, checkPlayerId) {
    if (!multiplayer) 
      return false;   
  }

  function createCards(imgUrls) {
    const cards = [];
    for (let i = 0, j = 0; i < imgUrls.length; i++, j += 2) {
      cards.push(
        //we have to create pairs of cards - that means 2 cards per 1 img
        {
          cardId: j,
          groupId: i,
          imgUrl: imgUrls[i],
        },
        {
          cardId: j + 1,
          groupId: i,
          imgUrl: imgUrls[i],
        }
      );
    }

    return cards;
  }

  function flipCard(cardId, groupId) {
    if (flippedCards.length >= 2 || (multiplayer && !onTurn)) {
      return;
    }

    if (flippedCards.length === 0) {
      flippedCards = [
        {
          cardId: String(cardId),
          groupId: String(groupId),
        },
      ];
      emitFlipCards();
    } else if (flippedCards[0].cardId === String(cardId)) {
      alert("You can't select the same object twice!");
    } else if (flippedCards[0].groupId === String(groupId)) {
      handleMatchFound(cardId, groupId);
    } else {
      handleNotMatch(cardId, groupId);
    }
  }

  function handleMatchFound(cardId, groupId) {
    flippedCards = [
      ...flippedCards,
      {
        cardId: String(cardId),
        groupId: String(groupId),
      },
    ]; //needed so that both cards will be displayed untill they're both added to matched
    emitFlipCards();

    localStats.foundInRow = localStats.foundInRow + 1;

    localStats.mostFoundInRow =
      localStats.mostFoundInRow > localStats.foundInRow
        ? localStats.mostFoundInRow
        : localStats.foundInRow;

    if (matchedPairs.length === cards.length / 2 - 1) {
      if (multiplayer) {
        socket.emit("show stats", lobbyId);
      } else {
        updateStats(localStats);
        stateMachine.emit({ type: "showStatistics" });
      }
    }

    setTimeout(() => {
      matchedPairs = [...matchedPairs, groupId]; //added after 1s so that their opacity will be lowered only after this second
      flippedCards = [];
      emitFlipCards();
      emitCardMatch();
    }, 1000);
  }

  function handleNotMatch(cardId, groupId) {
    flippedCards = [
      ...flippedCards,
      {
        cardId: String(cardId),
        groupId: String(groupId),
      },
    ]; //needed so that both cards will be displayed untill they're both turned upside down once again
    emitFlipCards();

    localStats.foundInRow = 0;

    setTimeout(() => {
      flippedCards = [];
      emitFlipCards();
      emitNextPlayer();
    }, 1000);
  }

  function emitFlipCards() {
    console.log(multiplayer, socket, lobbyId, onTurn);

    if (multiplayer && socket && lobbyId && onTurn && flippedCards.length < 3)
      socket.emit("flip card", lobbyId, flippedCards);
  }

  function emitCardMatch() {
    if (multiplayer && socket && lobbyId && onTurn && matchedPairs) {
      socket.emit("card match", lobbyId, matchedPairs);
    }
  }

  function emitNextPlayer() {
    if (multiplayer && socket && onTurn && lobbyId) {
      socket.emit("next player", lobbyId);
    }
  }

  function startGame() {
    if (cards.length <= 0) {
      cards = createCards(imgs);
    }

    flippedCards = [];
    matchedPairs = [];

    cards = cards?.sort(() => Math.random() - 0.5); //randomly shuffle cards
  }

  startGame();
</script>

{#if multiplayer}
  <div class="player-list">
    {#each players as { name, id } (id)}
      <span
        style:border={checkIfOnTurn(players, lobbyInfo?.playerOnTurn, id)
          ? "1px solid var(--primary)"
          : "none"}>{name}</span
      >
    {/each}
  </div>
{/if}
<div
  class="board"
  in:fade={{ duration: 500 }}
  style:grid-template-columns={`repeat(${columnCount}, calc(70vh / ${columnCount}))`}
>
  {#each cards as { cardId, groupId, imgUrl } (cardId)}
    {@const isFound = matchedPairs.includes(groupId)}
    {@const isFlipped =
      isFound || flippedCards.find((card) => card.cardId === String(cardId))}
    <button
      class:flipped={isFlipped}
      on:click={() => flipCard(cardId, groupId)}
    >
      <div class="img-container" class:found={isFound}>
        <img src={imgUrl} alt="card" />
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
