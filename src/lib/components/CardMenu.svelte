<!--<div in:fade={{ duration: 500, delay: 500 }} class="container">
  <header>
    <h1>Card Management Menu</h1>
    <button>Go To Main Menu</button>
  </header>
  <nav>
    <input type="text" placeholder="Filter card sets..." />
    <button class="create-set-btn">Create Set</button>
  </nav>
  <main>
    {#each Object.keys(sets) as setName, id (id)}
      {@const set = sets[setName]}
      <div class="card">
        <img src={set.imgUrls[0]} alt="" />
        <h3>{setName}</h3>
      </div>
    {/each}
  </main>
</div>

<style>
  .container {
    width: clamp(200px, 40vw, 800px);
  }

  h1 {
    color: #f0f0f0;
  }

  button {
    width: clamp(250px, 12rem, 1000px);
    font-size: 1.1rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--primary);
    background-color: transparent;
    color: #f0f0f0;
    cursor: pointer;
    transition: all 0.3s ease-out;
  }

  button:hover {
    background-color: var(--primary);
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .create-set-btn {
    font-size: 1.1rem;
    padding: 0.5rem;
  }

  input {
    padding: 0.5rem;
    font-size: 1.1rem;
    border: 1px solid var(--primary);
    border-radius: 8px;
    background-color: transparent;
    color: #f0f0f0;
  }

  input:focus {
    border: 1px solid var(--primary);
    outline: none;
  }

  .card {
    height: 210px;
    width: 210px;
    position: relative;
  }

  img {
    position: absolute;
    inset: 0;
    border: 1px solid var(--primary);
    padding: 1rem;
    border-radius: 8px;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }

  h3 {
    color: #f0f0f0;
  }

  main {
    max-width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
</style>
 -->

<script>
  import { fade } from "svelte/transition";

  import stateMachine from "$lib/stores/state.js";

  let pexesoPacks = [
    {
      id: 1,
      title: "testing set",
      imgUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/1200px-Svelte_Logo.svg.png",
      ],
    },
    {
      id: 2,
      title: "testing set2",
      imgUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/1200px-Svelte_Logo.svg.png",
      ],
    },
    {
      id: 3,
      title: "testing set3",
      imgUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/1200px-Svelte_Logo.svg.png",
      ],
    },
    {
      id: 4,
      title: "testing set4",
      imgUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/1200px-Svelte_Logo.svg.png",
      ],
    },
  ];

  let filter = "";
</script>

<div class="container">
  <header>
    <input placeholder="Filter..." bind:value={filter} />
    <button class="home-btn">Main Menu</button>
  </header>
  <main>
    <button class="card create-card">
      <h2>Create New Set</h2>
    </button>
    {#each pexesoPacks.filter( (pack) => pack.title.includes(filter) ) as pack (pack.id)}
      <div class="card">
        <div class="card-inner">
          <div class="front">
            <img src={pack.imgUrls[0]} alt="svelte logo" />
            <div class="title-container">
              <h2>{pack.title}</h2>
            </div>
          </div>
          <div class="back">
            <ul class="info">
              <li>Cards: {pack.imgUrls.length * 2}</li>
            </ul>
            <div class="btns">
              <button class="choose-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 1024 1024"
                  ><path
                    fill="#f0f0f0"
                    d="M77.248 415.04a64 64 0 0 1 90.496 0l226.304 226.304L846.528 188.8a64 64 0 1 1 90.56 90.496l-543.04 543.04l-316.8-316.8a64 64 0 0 1 0-90.496"
                  /></svg
                >
                <span class="tooltip">Choose</span>
              </button>
              <button class="modify-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  ><path
                    fill="#f0f0f0"
                    d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12q0-1.45-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12q0 1.45 1.013 2.475T12.05 15.5"
                  /></svg
                >
                <span class="tooltip">Modify</span>
              </button>
              <button class="delete-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  ><path
                    fill="#f0f0f0"
                    d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
                  /></svg
                >
                <span class="tooltip">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </main>
</div>

<style>
  header {
    width: clamp(200px, 30vw, 1000px);
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  input {
    box-sizing: border-box;
    padding: 0.5rem;
    font-size: 1.1rem;
    width: 200px;
    border: 1px solid var(--primary);
    border-radius: 8px;
    background-color: transparent;
    color: #f0f0f0;
  }

  .home-btn {
    padding: 0.5rem;
    color: #f0f0f0;
    background-color: transparent;
    border-radius: 8px;
    border: 1px solid var(--primary);
    cursor: pointer;
    width: 200px;
  }

  input:focus {
    border: 1px solid var(--primary);
    outline: none;
  }

  main {
    width: clamp(200px, 40vw, 1000px);
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  @media (max-width: 1000px) {
    main,
    header {
      width: clamp(200px, 90vw, 1000px);
    }
  }

  .card {
    box-sizing: border-box;
    width: 200px;
    min-height: 200px;
    position: relative;
  }

  .create-card {
    border: 1px solid var(--primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f0f0f0;
    cursor: pointer;
    background-color: transparent;
  }

  .create-card h2 {
    max-width: 80%;
    text-align: center;
    user-select: none;
    font-size: 1.4rem;
    transition: transform 0.3s ease-out;
  }

  .create-card:hover h2 {
    transform: scale(1.2);
  }

  .card-inner {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: rotate 0.3s ease-out;
  }

  .front,
  .back {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid var(--primary);
    overflow: hidden;
    backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .back {
    rotate: y 180deg;
  }

  .card:hover .card-inner {
    rotate: y 180deg;
  }

  img {
    width: 90%;
    height: 90%;
    object-fit: fill;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
  }

  .title-container {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f0f0f0;
    backdrop-filter: brightness(60%);
    border-radius: 8px;
  }

  .back {
    color: #f0f0f0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  ul {
    list-style: none;
  }

  .btns {
    display: flex;
    gap: 0.4rem;
  }

  .btns button {
    border-radius: 8px;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.4rem;
    cursor: pointer;
    transition: all 0.3s ease-out;

    position: relative;
  }

  .tooltip {
    visibility: hidden;
    position: absolute;
    background-color: black;
    color: #f0f0f0;
    text-align: center;
    width: 70px;
    border-radius: 8px;
    padding: 5px 0;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    margin-left: -35px;
  }

  .tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 8px;
    border-style: solid;
    border-color: black transparent transparent transparent;
  }

  .btns button:hover .tooltip {
    visibility: visible;
  }

  .choose-btn {
    border: 1px solid var(--success);
  }

  .choose-btn:hover {
    background-color: var(--success);
  }

  .modify-btn {
    border: 1px solid var(--secondary);
  }

  .modify-btn:hover {
    background-color: var(--secondary);
  }

  .delete-btn {
    border: 1px solid var(--error);
  }

  .delete-btn:hover {
    background-color: var(--error);
  }
</style>
