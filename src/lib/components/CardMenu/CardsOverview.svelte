<script>
  import { authStore } from "../../stores/auth";

  import { userData } from "../../stores/userData";
  import defaultPacks from "$lib/defaultPacks";

  import {usersRef} from "../../firebase/firebase.client"
  
  import stateMachine from "$lib/stores/state.js";

  import { storage } from "../../firebase/firebase.client";
  import { doc, getDoc, updateDoc } from "firebase/firestore";
  import { listAll, ref, deleteObject } from "firebase/storage";
  
  $: singedIn = ($authStore.user !== null);

  $: pexesoPacks = $userData.packs || defaultPacks;

  console.log($userData.packs);

  let filter = "";
  let imgWidth;

  function removePack(packId) {
    $userData.packs = pexesoPacks.filter((pexesoPack) => pexesoPack?.id !== packId);

    getDoc(doc(usersRef, $authStore.user.uid)).then((userDoc) => {
      const packs = userDoc.data().packs;

      delete packs[packId];

      updateDoc(doc(usersRef, $authStore.user.uid), {
        packs: packs,
      }).then(() => {
        console.log("Document successfully updated!");
      }).catch((error) => {
        console.error("Error updating document: ", error);
      });
    });

    listAll(ref(storage, `packs/${packId}`)).then((res) => {
      res.items.forEach((itemRef) => {
        deleteObject(itemRef).then(() => {
          console.log(`File deleted successfully`);
        }).catch((error) => {
          console.log(`Failed to delete file`);
        });
      });
    });
  }
</script>

<header>
  <input
    placeholder="Filter..."
    bind:value={filter}
  />
  <button
    class="home-btn"
    on:click={() => {
      stateMachine.emit({ type: "goToMainMenu" });
    }}>Main Menu</button
  >
</header>
<main>
  <button class="card create-card" on:click={() => {
    $userData.modifiedPack = {
      id: null,
      title: "",
      imgUrls: [],
    }
  }
  } disabled='{!singedIn}'>
    <h2>Create New Pack</h2>
  </button>
  {#each pexesoPacks.filter((pack) => pack && pack?.title.includes(filter)) as pack (pack.id)}
    <div class="card" bind:clientWidth={imgWidth}>
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
            <button
              class="choose-btn"
              on:click={() => {
                $userData.chosenPack = pack;
                stateMachine.emit({ type: "goToMainMenu" });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 1024 1024"
                ><path
                  fill="#f0f0f0"
                  d="M77.248 415.04a64 64 0 0 1 90.496 0l226.304 226.304L846.528 188.8a64 64 0 1 1 90.56 90.496l-543.04 543.04l-316.8-316.8a64 64 0 0 1 0-90.496"
                /></svg
              >
              <span class="tooltip">Choose</span>
            </button>
            {#if pack.id !== 0}
              <!-- we don't want to enable to modify nor delete the default pack -->
              <button
                class="modify-btn"
                on:click={() => {
                  $userData.modifiedPack = pack;
                }}
                disabled='{!singedIn}'
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  ><path
                    fill="#f0f0f0"
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"
                  /></svg
                >
                <span class="tooltip">Modify</span>
              </button>
              <button class="delete-btn" on:click={() => {removePack(pack.id)}} disabled='{!singedIn}'>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  ><path
                    fill="#f0f0f0"
                    d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
                  /></svg
                >
                <span class="tooltip">Delete</span>
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}
</main>

<style>
  header {
    width: clamp(200px, 80vw, 600px);
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
  }

  input {
    box-sizing: border-box;
    padding: 0.5rem;
    font-size: 1.1rem;
    border: 1px solid var(--primary);
    outline: none;
    border-radius: 8px;
    background-color: transparent;
    color: #f0f0f0;
    flex: 1;
  }


  .home-btn {
    padding: 0.5rem;
    font-size: 1.1rem;
    color: #f0f0f0;
    background-color: transparent;
    border-radius: 8px;
    border: 1px solid var(--primary);
    cursor: pointer;
    flex: 1;
    transition: all 0.3s ease-out;
  }

  .home-btn:hover {
    background-color: var(--primary);
  }

  main {
    width: clamp(200px, 80vw, 600px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    justify-content: center;
    gap: 0.8rem;
  }

  .card {
    box-sizing: border-box;
    aspect-ratio: 1 / 1;
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
    color: #f0f0f0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .card:hover .card-inner {
    rotate: y 180deg;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
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

  button:hover .tooltip {
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

  ul {
    list-style-type: none;
  }
</style>
