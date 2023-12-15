<script>
  import { fade } from "svelte/transition";

  import stateMachine from "$lib/stores/state.js";

  export let imgs;
  export let updateStats;

  let localStats = {
    foundInRow: 0,
    mostFoundInRow: 0,
  };

  let cards = [];
  let flippedCards = [];
  let matchedPairs = [];

  $: {
    console.log(cards);
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
    if (flippedCards.length >= 2) {
      return;
    }

    if (flippedCards.length === 0) {
      flippedCards = [
        {
          cardId: String(cardId),
          groupId: String(groupId),
        },
      ];
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
    localStats.foundInRow = localStats.foundInRow + 1;

    localStats.mostFoundInRow =
      localStats.mostFoundInRow > localStats.foundInRow
        ? localStats.mostFoundInRow
        : localStats.foundInRow;

    if (matchedPairs.length === cards.length / 2 - 1) {
      updateStats(localStats);
      stateMachine.emit({ type: "showStatistics" });
    }

    setTimeout(() => {
      matchedPairs = [...matchedPairs, groupId]; //added after 1s so that their opacity will be lowered only after this second
      flippedCards = [];
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
    localStats.foundInRow = 0;

    setTimeout(() => {
      flippedCards = [];
    }, 1000);
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

<div class="board" in:fade={{ duration: 500 }}>
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
  .board {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.8rem;
  }

  button {
    height: 170px;
    width: 170px;
    cursor: pointer;
    border-radius: 12px;
    border: 2px solid var(--primary);
    background-color: var(--bg);
    rotate: y 0deg;
    transform-style: preserve-3d;
    transition: all 0.3s ease-out;
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
    max-height: 140px;
    max-width: 140px;
    -webkit-user-drag: none;
    user-select: none;
    -webkit-user-select: none;
  }
</style>
