<main>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Pexeso's solved</th>
          <th>Least moves</th>
          <th>Most pairs found in a row</th>
          <th>Country</th>
        </tr>
        <tr>
          <td>Cupomaz</td>
          <td>7</td>
          <td>13</td>
          <td>4</td>
          <td>DE</td>
        </tr>
        <tr>
          <td>dr0th3r</td>
          <td>32</td>
          <td>10</td>
          <td>6</td>
          <td>CZ</td>
        </tr>
        <tr>
          <td>government</td>
          <td>16</td>
          <td>15</td>
          <td>5</td>
          <td>UG</td>
        </tr>
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
    width: 100wh;
    height: 100vh;
    flex-direction: column;
    background-color: #111827;
  }

  .table-container {
    box-sizing: border-box;
    width: clamp(
      250px,
      90vw,
      930px
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
