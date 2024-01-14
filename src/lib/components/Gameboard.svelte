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

  let messages = [];

  $: players = lobbyInfo?.players || [];

  if (!multiplayer) {
    $socketStore?.emit("create lobby", $userData.displayName, true, imgs);
  }

  $socketStore?.on("flip card", (card) => {
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

  $socketStore.on("chat", (playerName, msg) => {
    messages = [
      ...messages,
      {
        name: playerName,
        msg: msg,
      },
    ];
  });

  let flippedCards = [];
  let matchedPairs = [];

  $: columnCount = Math.ceil(Math.sqrt(imgs.length * 2));

  function flipCard(cardId) {
    $socketStore?.emit("flip card", cardId);
  }

  function startGame() {
    $socketStore?.emit("set stats", $userData);
    flippedCards = [];
    matchedPairs = [];
  }
  function checkIfOnTurn(id) {
    return lobbyInfo.players[playerOnTurn].id == id;
  }

  startGame();

  $: console.log(lobbyInfo);
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
        <li>Games played: {stats?.gamesPlayed}</li>
        <li>Pairs found: {stats?.pairsFound}</li>
        <li>Most in row: {stats?.mostFoundInRow}</li>
        <li>Cards flipped: {stats?.currCardsFlipped}</li>
      </ul>
    </div>
  {/each}
</div>
{#if lobbyInfo?.players?.length > 1}
  <div class="chat">
    <div class="chat-msgs">
      {#each messages as msg}
        <div>
          <p style:font-weight="bold">{msg.name}</p>
          <p>{msg.msg}</p>
        </div>
      {/each}
    </div>
    <form
      class="chat-input"
      on:submit|preventDefault={(e) => {
        const msg = new FormData(e.target).get("msg");

        if (!msg) return;

        $socketStore.emit("chat", msg);
        e.target.reset();
      }}
    >
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
</style>
