<script lang="ts">
  import { fade } from "svelte/transition";

  import defaultPacks from "$lib/defaultPacks";

  import type { Card, SocketCard, GameStats, ClientPack } from "$lib/types";
  import { socketStore } from "$lib/stores/socket";
  import userData from "$lib/stores/userData";
  import CardMenu from "./CardMenu.svelte";

  export let multiplayer = false;

  import gameStats from "$lib/stores/gameStats";
  import state from "$lib/stores/state";
  import { doc, updateDoc } from "firebase/firestore";
  import { db } from "$lib/firebase/firebase.client";

  let cardCount = 0;

  $: columnCount = Math.ceil(Math.sqrt(cardCount));
  
  let matchedCards: SocketCard[] = [];
  let flippedCards: SocketCard[] = [];

  let messages: {
    name: string;
    msg: string;
  }[] = [];


  $socketStore?.on("game started", (initialStats: {
    id: string;
    newStats: GameStats
  }[], newCardCount: number) => {

    $gameStats = initialStats.reduce((acc, curr) => {
      acc[curr.id] = curr.newStats;

      return acc;
    }, {} as {
      [key: string]: GameStats
    })

    cardCount = newCardCount;
  })

  $socketStore?.on("card flipped", (card: SocketCard, stats: {
    id: string;
    newStats: Partial<GameStats>
  }) => {
    flippedCards = [...flippedCards, card];

    $gameStats[stats.id] = {
      ...$gameStats[stats.id],
      ...stats.newStats
    }
  })

  $socketStore?.on("cards matched", (cards: SocketCard[], stats: {
    id: string;
    newStats: Partial<GameStats>
  }) => {
    matchedCards = [...matchedCards, ...cards];
    flippedCards = []

    $gameStats[stats.id] = {
      ...$gameStats[stats.id],
      ...stats.newStats
    }
  })

  $socketStore?.on("flip cards back", (stats: {
    id: string;
    newStats: Partial<GameStats>
  }) => {
    flippedCards = []

    $gameStats[stats.id] = {
      ...$gameStats[stats.id],
      ...stats.newStats
    }
  })

  $socketStore?.on("game ended", async (stats: {
    id: string;
    newStats: Partial<GameStats>
  }) => {
    $gameStats[stats.id] = {
      ...$gameStats[stats.id],
      ...stats.newStats
    }

    if (!$userData) return
    $userData.stats = {
      ...$userData.stats,
      gamesPlayed: $userData.stats.gamesPlayed + 1,
      leastCardsFlipped: Math.min(
        $userData.stats.leastCardsFlipped, 
        $gameStats[$userData.socketId].currCardsFlipped
      ),
      mostCardsFoundInRow: Math.max(
        $userData.stats.mostCardsFoundInRow, 
        $gameStats[$userData.socketId].mostCardsFoundInRow
      ),
    }

    if ($userData.dbId) {
      await updateDoc(doc(db, "users", $userData.dbId), {
        stats: $userData.stats
      })
    }

    state.emit({type: "show statistics"})
  })

  $socketStore?.on("message sent", (msg: {
    name: string;
    msg: string;
  }) => {
    messages = [...messages, msg];
  })

  $socketStore?.on("game deleted", () => {
    state.emit({ type: "go to main menu", sendLeaveGame: false })
  })

  function flipCard(id: number) {
    if (flippedCards.length >= 2 || flippedCards[0]?.id === id) {
      return;
    }

    $socketStore?.emit("flip card", id);
  }

  function sendMessage(event: Event) {
    event.preventDefault();

    const msg = (event.target as HTMLFormElement).msg.value;

    if (msg.length > 0) {
      $socketStore?.emit("send message", msg);
    }

    (event.target as HTMLFormElement).msg.value = "";
  }

  function scrollChat(node: HTMLElement) {
    function scroll() {
      node.scroll({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    }

    scroll();

    return { update: scroll }
  }

  if (!multiplayer) {
    $socketStore?.emit("start singleplayer game", $userData);
  }
</script>

<div class="gameboard-container">
  {#if multiplayer}
    <div class="player-list">
    </div>
  {/if}
  <div
    class="board"
    in:fade={{ duration: 500 }}
    style:grid-template-columns="repeat({columnCount}, min(calc(60vw / {columnCount}),
    calc(70vh / {columnCount})))"
  >
    {#each Array(cardCount) as _, index (index)}
      {@const matchedCard = matchedCards.find((el) => el?.id === index) || null}
      {@const flippedCard = flippedCards.find((el) => el?.id === index) || null}
      {@const isFlipped = matchedCard !== null || flippedCard !== null}
      {@const card = matchedCard || flippedCard || null}
      <button class:flipped={isFlipped} on:click={() => flipCard(index)}>
        <div class="img-container" class:found={matchedCard !== null}>
          <img
            src={card !== null
              ? card.imgUrl
              : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRizdEOe0q947NoDnyXrN5X5HiiyCA7OTyZ47vTocXzjQ&s"}
            alt="card"
          />
        </div>
        <div class="logo-container">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRizdEOe0q947NoDnyXrN5X5HiiyCA7OTyZ47vTocXzjQ&s"
            alt="remante logo"
          />
        </div>
      </button>
    {/each}
  </div>
  <div class="stats">
    {#if multiplayer}
      {#each Object.values($gameStats) as players}
        <div>
          <p style:font-weight="bold">{players?.name}</p>
          <ul>
            <li>Most pairs found in row:&nbsp;{players?.mostCardsFoundInRow}</li>
            <li>Currently pairs found in row:&nbsp;{players?.currCardsFoundInRow}</li>
            <li>Cards flipped: {players?.currCardsFlipped}</li>
          </ul>
        </div>
      {/each}
    {:else}
      {@const stats = $userData?.socketId ? $gameStats[$userData?.socketId] : {
        name: "unknown",
        mostCardsFoundInRow: 0,
        currCardsFlipped: 0,
        currCardsFoundInRow: 0,
        currTime: 0,
      }}
      <div>
        <p style:font-weight="bold">{stats?.name}</p>
        <ul>
          <li>Most pairs found in row:&nbsp;{stats?.mostCardsFoundInRow}</li>
          <li>Currently pairs found in row:&nbsp;{stats?.currCardsFoundInRow}</li>
          <li>Cards flipped: {stats?.currCardsFlipped}</li>
        </ul>
      </div>
    {/if}
  </div>
  {#if multiplayer && Object.keys($gameStats).length > 0}
    <div class="chat" use:scrollChat={messages}> 
      <div class="chat-msgs">
        {#each messages as msg}
          <div>
            <p style:font-weight="bold">{msg.name}</p>
            <p>{msg.msg}</p>
          </div>
        {/each}
      </div>
      <form class="chat-input" on:submit|preventDefault={sendMessage}>
        <input name="msg" />
        <button type="submit">Post</button>
      </form>
    </div>
  {/if}
</div>


<style>
  .gameboard-container {
    width: 100%;
    display: flex;
    justify-content: center;
    position: relative;
  }

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

  .img-container,
  .logo-container {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    backface-visibility: hidden;
  }

  .img-container {
    rotate: y 180deg;
  }

  .logo-container {
    rotate: y 0deg;
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

  .stats {
    position: absolute;
    right: 0;
    top: 0;
    padding: 1rem;
    border-left: 2px solid var(--primary);
    border-top: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
    border-radius: 8px 0 0 8px;
    color: var(--text);
    max-width: 10vw;
    max-height: 60vw;
    overflow-y: auto;
  }

  ul {
    list-style: none;
  }

  .chat {
    position: absolute;
    top: 0;
    left: 0;
    padding: 1rem;
    border-right: 2px solid var(--primary);
    border-top: 2px solid var(--primary);
    border-bottom: 2px solid var(--primary);
    border-radius: 0 8px 8px 0;
    max-height: 60vw;
    overflow-y: auto;
  }

  .chat-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 10vw;
  }

  .chat-input button {
    padding: 0.5rem;
    aspect-ratio: auto;
  }

  input {
    padding: calc(0.5rem / 1.1);
    box-sizing: border-box;
    border: 2px solid var(--primary);
    outline: none;
    background-color: transparent;
    border-radius: 8px;
    color: var(--text);
    font-size: 1.1rem;
    flex: 1 1 0;
    min-width: 0;
  }

  .chat-msgs {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-bottom: 0.5rem;
    color: var(--text);
  }

  @media (max-width: 800px) {
    .stats {
      top: -50%;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      min-width: fit-content;
      right: 50%;
      transform: translate(50%, 50%);
      border-right: 2px solid var(--primary);
      border-radius: 8px;
      text-align: center;
    }

    .chat {
      top: 105%;
      left: 50%;
      transform: translate(-50%, 0);
      border: 2px solid var(--primary);
      border-radius: 8px;
      width: 60vw;
      max-height: 10vh;
    }

    .chat-input {
      flex-direction: row;
      gap: 0.5rem;
      max-width: 100%;
    }

    @media (max-width: 600px) {
      .stats {
        top: -30vh;
        min-width: 60vw;
        max-height: 10vh;
        overflow-y: scroll;
      }

      .stats div {
        flex: 1;
        min-width: 100px;
      }
    }
  }
</style>
