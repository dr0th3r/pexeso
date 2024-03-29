<script lang="ts">
  import { fade } from "svelte/transition";

  import { userData } from "$lib/stores/userData";
  import defaultPacks from "../defaultPacks";

  import { socketStore } from "$lib/stores/socket";

  import type { LobbyInfo, Message, Card } from "$lib/types";

  export let multiplayer = false;
  export let lobbyInfo: LobbyInfo;

  let imgs = multiplayer
    ? lobbyInfo?.pack.imgUrls || defaultPacks[0].imgUrls
    : $userData.chosenPack.imgUrls || defaultPacks[0].imgUrls;

  let playerOnTurn = 0;

  let messages: Message[] = [];

  let flippedCards: Card[] = [];

  let matchedPairs: Card[] = [];

  $: players = lobbyInfo?.players || [];

  if (!multiplayer) {
    $socketStore?.emit("create lobby", $userData.displayName, true, imgs);
  }

  $socketStore?.on("flip card", (card) => {
    flippedCards = [...flippedCards, card];
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
    if (!lobbyInfo) return;

    lobbyInfo.players = remainingPlayers;
    lobbyInfo = lobbyInfo;
  });

  $socketStore?.on("next player", (nextPlayer) => {
    playerOnTurn = nextPlayer;
    lobbyInfo = lobbyInfo;
  });

  $socketStore?.on("set temp stats", (playerId, stats) => {
    console.log(players, playerId, stats);
    if (players?.length === 0) {
      console.log(lobbyInfo);
    }

    const player = players?.find((player) => player.id === playerId);
    if (stats.leastCardsFlipped === null) {
      stats.leastCardsFlipped = Infinity;
    }

    if (player) {
      player.stats = stats;
    }
    //player.stats = stats;
    lobbyInfo = lobbyInfo; //for svelte to update
  });

  $socketStore?.on("chat", (playerName, msg) => {
    messages = [
      ...messages,
      {
        name: playerName,
        msg: msg,
      },
    ];
  });

  $: columnCount = Math.ceil(Math.sqrt(imgs.length * 2));

  function flipCard(cardId: number) {
    $socketStore?.emit("flip card", cardId);
  }

  function startGame() {
    $socketStore?.emit("set stats", $userData);
    flippedCards = [];
    matchedPairs = [];
  }
  function checkIfOnTurn(id: string) {
    if (!lobbyInfo) return false;

    return lobbyInfo.players[playerOnTurn].id == id;
  }

  startGame();

  function scrollChat(node: HTMLElement) {
    function scroll() {
      node.scroll({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    }
    scroll();

    return { update: scroll };
  }

  function postMsg({ target }: { target: HTMLFormElement }) {
    const msg = new FormData(target).get("msg");

    if (!msg) return;

    $socketStore?.emit("chat", msg);
    target.reset();
  }
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
  style:grid-template-columns="repeat({columnCount}, min(calc(60vw / {columnCount}),
  calc(70vh / {columnCount})))"
>
  {#each Array(imgs.length * 2) as _, index (index)}
    {@const matchedCard = matchedPairs.find((e) => e.cardId == index) || null}
    {@const flippedCard = flippedCards.find((e) => e.cardId == index) || null}
    {@const isFlipped = matchedCard != null || flippedCard != null}
    {@const card = matchedCard == null ? flippedCard : matchedCard}
    <button class:flipped={isFlipped} on:click={() => flipCard(index)}>
      <div class="img-container" class:found={matchedCard != null}>
        <img
          src={card != null
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
  {#each players || [] as player}
    {@const stats = player?.stats}
    <div>
      <p style:font-weight="bold">{player?.name}</p>
      <ul>
        <li>Games played:&nbsp;{stats?.gamesPlayed}</li>
        <li>Pairs found:&nbsp;{stats?.pairsFound}</li>
        <li>Most in row:&nbsp;{stats?.mostFoundInRow}</li>
        <li>Cards flipped:&nbsp;{stats?.currCardsFlipped}</li>
      </ul>
    </div>
  {/each}
</div>
{#if lobbyInfo?.players?.length || 0 > 1}
  <div class="chat" use:scrollChat={messages}> 
    <div class="chat-msgs">
      {#each messages as msg}
        <div>
          <p style:font-weight="bold">{msg.name}</p>
          <p>{msg.msg}</p>
        </div>
      {/each}
    </div>
    <form class="chat-input" on:submit|preventDefault={postMsg}>
      <input name="msg" />
      <button type="submit">Post</button>
    </form>
  </div>
{/if}

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
