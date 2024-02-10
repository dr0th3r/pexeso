<script lang="ts">
  import { onMount } from "svelte";

  import { usersRef } from "$lib/firebase/firebase.client";
  import { query, orderBy, limit, getDocs } from "firebase/firestore";

  import state from "$lib/stores/state";

  let users: LeaderboardUser[] = [];

  $: sortedUsers = users.sort((a: LeaderboardUser, b: LeaderboardUser) => {
    if (sortCategory === "name") {
      return a.name > b.name ? 1 : -1;
    } else {
      return a.stats[sortCategory] > b.stats[sortCategory] ? 1 : -1;
    }
  })

  interface LeaderboardUser {
    name: string;
    stats: {
      gamesPlayed: number;
      leastCardsFlipped: number;
      mostCardsFoundInRow: number;
    }
  }

  type Category = "name" | "gamesPlayed" | "leastCardsFlipped" | "mostCardsFoundInRow";

  const categories: Category[] = [
    "name",
    "gamesPlayed",
    "leastCardsFlipped",
    "mostCardsFoundInRow"
  ]

  onMount(async () => {
    const snapshot = await getDocs(
      query(usersRef, orderBy("name"), limit(10))
    );
    users = snapshot.docs.map((doc) => {
      const docData = doc.data();
      
      return {
        name: docData.name,
        stats: {
          gamesPlayed: docData.stats.gamesPlayed || 0,
          leastCardsFlipped: docData.stats.leastCardsFlipped,
          mostCardsFoundInRow: docData.stats.mostCardsFoundInRow,
        }
      };
    });
  });

  let sortCategory: Category = "gamesPlayed";
  let isDescending = true;

  function handleFilter(category: Category) {
    if (category === sortCategory) {
      isDescending = !isDescending;
    } else {
      sortCategory = category;
      isDescending = true;
    }
  }

  function camelToNormal(str: string) {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }
</script>

<main>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          {#each categories as category}
            <th on:click={() => handleFilter(category)}>
              <span class="outer-span">
                {@html `${camelToNormal(category)}&nbsp;${
                  category === sortCategory ? (isDescending ? "▼" : "▲") : ""
                }`}
              </span>
            </th>
          {/each}
        </tr>
        {#each sortedUsers as user}
          <tr>
            {#each categories as category}
              <td>{category === "name" ? user.name : user.stats[category]}</td>
            {/each}
          </tr>
        {/each}
      </thead>
    </table>
  </div>
  <button on:click={() => state.emit({ type: "go to main menu" })}>
    Back to Main Menu
  </button>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #111827;
    width: 100vw;
  }

  .table-container {
    box-sizing: border-box;
    min-width: 250px;
    max-width: 90vw;
    max-height: 70vh;
    overflow: auto;
  }

  table {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-collapse: collapse;
  }

  th {
    font-size: 1.4rem;
    text-align: left;
    user-select: none;
    cursor: pointer;
    min-width: 100px;
  }

  td {
    font-size: 1.3rem;
  }

  th,
  td {
    padding: 1rem 1.2rem;
    color: #f0f0f0;
  }

  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  tr:first-child td:first-child {
    border-radius: 8px 0 0 0;
  }

  tr:first-child td:last-child {
    border-radius: 0 8px 0 0;
  }

  tr:last-child td:first-child {
    border-radius: 0 0 0 8px;
  }

  tr:last-child td:last-child {
    border-radius: 0 0 8px 0;
  }

  button {
    width: clamp(250px, 10rem, 1000px);
    font-size: 1.1rem;
    padding: 1rem 2rem;
    border-radius: 8px;
    border: 1px solid var(--primary);
    background-color: transparent;
    cursor: pointer;
    transition: all 0.3s ease-out;
    margin-top: 0.8rem;
    color: var(--text);
  }

  button:hover {
    background-color: var(--primary);
  }

  @media (max-width: 800px) {
    th {
      font-size: 1.1rem;
    }

    td {
      font-size: 1rem;
    }
  }
</style>
