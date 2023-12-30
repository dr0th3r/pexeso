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

  let cards = [];
  let flippedCards = [];
  let matchedPairs = [];

  $: columnCount = Math.ceil(Math.sqrt(imgs.length * 2));

  function checkIfOnTurn(players, playerOnTurn, checkPlayerId) {
    if (!multiplayer) return true;
    return players[playerOnTurn]?.id === checkPlayerId || false;
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

    $userData.currCardsFlipped = $userData.currCardsFlipped + 1 || 1;

    console.log($userData.currCardsFlipped);

    if (matchedPairs.includes(groupId)) {
      alert("You can't select a card that has already been found!");
    } else if (flippedCards.length === 0) {
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

  async function handleMatchFound(cardId, groupId) {
    flippedCards = [
      ...flippedCards,
      {
        cardId: String(cardId),
        groupId: String(groupId),
      },
    ]; //needed so that both cards will be displayed untill they're both added to matched
    emitFlipCards();

    $userData.currFoundInRow = $userData.currFoundInRow + 1;

    $userData.mostFoundInRow =
      $userData.mostFoundInRow > $userData.currFoundInRow
        ? $userData.mostFoundInRow
        : $userData.currFoundInRow;

    console.log($userData.mostFoundInRow);

    if (matchedPairs.length === cards.length / 2 - 1) {
      $userData.leastCardsFlipped =
        $userData.currCardsFlipped < $userData.leastCardsFlipped
          ? $userData.currCardsFlipped
          : $userData.leastCardsFlipped;

      console.log($userData.leastCardsFlipped, $userData.currCardsFlipped);

      $userData.gamesPlayed = $userData.gamesPlayed + 1;

      $userData.currCardsFlipped = 0;
      $userData.currFoundInRow = 0;

      if ($authStore?.user) {
        try {
          await updateDoc(doc(db, "users", $authStore?.user?.uid), {
            mostFoundInRow: $userData.mostFoundInRow,
            leastCardsFlipped: $userData.leastCardsFlipped,
            gamesPlayed: $userData.gamesPlayed,
          });
        } catch (error) {
          console.error(error);
        }
      }

      if (multiplayer) {
        socket.emit("show stats", lobbyId);
      } else {
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

    $userData.currFoundInRow = 0;

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

  let devMode = true;
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
  style:grid-template-columns="repeat({columnCount}, min(calc(75vw / {columnCount}),
  calc(75vh / {columnCount})))"
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
        <img
          src={isFlipped || devMode ? imgUrl : "./never_gonna.jpg"}
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
