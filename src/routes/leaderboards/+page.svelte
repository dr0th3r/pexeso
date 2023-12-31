<script>
  import { onMount } from "svelte";

  import { usersRef } from "$lib/firebase/firebase.client.js";
  import { query, orderBy, limit, getDocs } from "firebase/firestore";

  import { loadingStore } from "$lib/stores/loading.js";

  onMount(async () => {
    const snapshot = await getDocs(
      query(usersRef, orderBy("gamesPlayed"), limit(10))
    );
    users = snapshot.docs.map((doc) => {
      const docData = doc.data();
      console.log(docData.gamesPlayed);

      return {
        username: docData.displayName,
        gamesPlayed: docData.gamesPlayed || 0,
        leastMoves: docData.leastCardsFlipped,
        mostPairsFoundInRow: docData.mostFoundInRow,
      };
    });
  });

  let users = [];

  $: if (users.length === 0) {
    loadingStore.startLoading("Loading leaderboards...");
  } else {
    loadingStore.updateProgress(1);
    setTimeout(() => {
      loadingStore.stopLoading();
    }, 500);
  }

  $: categories = Object.keys(users[0] || {});

  let sortCategory = "gamesPlayed";
  let isDescending = true;

  function handleFilter(category) {
    if (category === sortCategory) {
      isDescending = !isDescending;
    } else {
      sortCategory = category;
      isDescending = true;
    }
  }

  function camelToNormal(str) {
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
        {#each users.sort((a, b) => (a[sortCategory] > b[sortCategory] ? 1 : -1) * (isDescending ? -1 : 1)) as user}
          <tr>
            {#each categories as category}
              <td>{user[category]}</td>
            {/each}
          </tr>
        {/each}
      </thead>
    </table>
  </div>
  <button>Back To Menu</button>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #111827;
  }

  .table-container {
    box-sizing: border-box;
    width: clamp(
      250px,
      90vw,
      90vw
    ); /* 600px for the table + 30 px for the padding*/
    overflow-x: auto;
    padding: 15px;
    display: flex;
    justify-content: center;
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
    max-width: 200px;
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
    border: 1px solid #9f1239;
    background-color: transparent;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease-out;
    margin-top: 0.6rem;
    margin-left: 0.4rem;
  }

  button:hover {
    background-color: #9f1239;
  }
</style>
