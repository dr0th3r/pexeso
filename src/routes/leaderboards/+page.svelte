<script>
  let users = [
    {
      username: "Cupomaz",
      pexesosSolved: 7,
      leastMoves: 13,
      mostPairsFoundInRow: 4,
      country: "DE",
    },
    {
      username: "dr0th3r",
      pexesosSolved: 32,
      leastMoves: 10,
      mostPairsFoundInRow: 6,
      country: "CZ",
    },
    {
      username: "government",
      pexesosSolved: 16,
      leastMoves: 15,
      mostPairsFoundInRow: 5,
      country: "UG",
    },
  ];

  $: categories = Object.keys(users[0]);

  let sortCategory = "pexesosSolved";
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
            <td>{user.username}</td>
            <td>{user.pexesosSolved}</td>
            <td>{user.leastMoves}</td>
            <td>{user.mostPairsFoundInRow}</td>
            <td>{user.country}</td>
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
