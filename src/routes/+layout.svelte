<script>
  import { imgUrls } from "$lib/stores.js";

  let packs = [
    [
      //default pack included
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/1200px-Svelte_Logo.svg.png",
      "https://cdn.worldvectorlogo.com/logos/next-js.svg",
      "https://angular.io/assets/images/logos/angularjs/AngularJS-Shield.svg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/2367px-Vue.js_Logo_2.svg.png",
      "data:image/png;base64,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",
      "https://emberjs.com/images/brand/ember-tomster-lockup-4c.svg",
      "https://cdn.worldvectorlogo.com/logos/meteor-icon.svg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/NestJS.svg/1200px-NestJS.svg.png",
    ],
  ];

  let imgs = [];
  $: urls = Array.from(imgs).map((img) => URL.createObjectURL(img));

  let inPackMenu = false;
  let creatingNewPack = false;

  let tooFewImgs = false;
</script>

<header>
  <h1><a href="/">Pexeso</a></h1>
  <ul>
    <li id="leaderboards"><a href="/leaderboards">Leaderboards</a></li>
    <li
      id="add-cards"
      on:click={() => {
        inPackMenu = true;
      }}
    >
      Add Cards
    </li>
  </ul>
</header>

<div class="add-cards-container {inPackMenu && 'show'}">
  <form class="add-cards-inner">
    {#if tooFewImgs}
      <div class="too-few-imgs">
        <p>You must provide at least 3 images</p>
        <div class="too-few-imgs-btns">
          <button
            on:click={() => {
              tooFewImgs = false; //continue adding more images
            }}>Add more images</button
          >
          <button
            on:click={() => {
              imgs = [];
              creatingNewPack = false;
              tooFewImgs = false;
            }}>Don't save</button
          >
        </div>
      </div>
    {/if}

    <header>
      <input type="text" placeholder="Filter..." />
      {#if creatingNewPack}
        <button
          id="save-button"
          on:click={() => {
            if (urls.length > 2) {
              packs = [...packs, urls];
              imgs = [];
              creatingNewPack = false;
            } else {
              tooFewImgs = true;
            }
          }}>Save</button
        >
      {:else}
        <button on:click={() => (creatingNewPack = true)} id="create-new-pack"
          >Create new pack</button
        >
      {/if}
    </header>

    {#if creatingNewPack}
      <input
        type="file"
        name="img"
        id="img"
        accept="img/jpeg, img/png"
        multiple
        bind:files={imgs}
      />

      {#each urls as url}
        <img src={url} alt="preview" />
      {/each}
    {:else if packs.length > 0}
      {#each packs as pack, i}
        <img src={pack[0]} alt="preview" />
        <div class="pack-btns">
          <button
            class="play-with-pack-btn"
            id="play-with-pack-btn"
            on:click={() => {
              if (pack.length > 2) {
                imgUrls.update(() => pack);
                inPackMenu = false;
              } else {
                console.log("how is this even possible");
              }
            }}>Play with pack</button
          >
          {#if i > 0}
            <!-- Can't remove initial pack -->
            <button
              class="remove-pack-btn"
              on:click={() => {
                packs.splice(i, 1);
                packs = packs; //needed to trigger reactivity
              }}>Remove pack</button
            >
          {/if}
        </div>
      {/each}
    {/if}
  </form>
</div>

<slot />

<style>
  * {
    margin: 0;
    padding: 0;
  }

  header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    color: white;
    align-items: stretch;
  }

  header h1 {
    padding: 0 1rem;
    border-style: solid;
    border-width: 0 2px 2px 0;
    border-bottom-right-radius: 20px;
    background-color: rgba(255, 255, 255, 0.1);
  }

  h1 a {
    font-weight: 300;
  }

  ul {
    list-style-type: none;
    height: 48px;
  }

  li {
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    float: right;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    box-sizing: border-box;
  }

  #add-cards {
    border-right: 2px solid white;
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    border-bottom-left-radius: 20px;
  }

  #leaderboards {
    border-bottom: 2px solid white;
  }

  a,
  a:hover,
  a:focus,
  a:active {
    text-decoration: none;
    color: white;
  }

  .add-cards-container {
    display: none;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.4);
    background-blend-mode: darken;
  }

  #create-new-pack {
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    border-bottom-left-radius: 10px;
    padding: 0 1rem 0 1rem;
  }

  #save-button {
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    border-bottom-left-radius: 10px;
    padding: 0 1rem 0 1rem;
  }

  .add-cards-container button,
  button:focus,
  button:active {
    background: none;
    outline: none;
    background-color: transparent;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: white;
  }

  input[type="file"] {
    margin-top: 10px;
  }

  .pack-btns {
    display: flex;
    justify-content: center;
  }

  .pack-btns button {
    margin: 0 0.5rem;
  }

  .show {
    display: flex;
  }

  .add-cards-inner {
    height: 60vh;
    overflow-y: scroll;
    min-width: max(20vw, 400px);
    background-color: #000000;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    border: 2px solid white;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .add-cards-inner img {
    margin: 20px 0;
  }

  #play-with-pack-btn {
    border: 2px solid white;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
  }

  .remove-pack-btn {
    border: 2px solid white;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
  }

  img {
    height: 200px;
    width: 200px;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
  }

  .too-few-imgs {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    padding: 1rem;
    justify-content: space-between;
    height: clamp(100px, 10vh, 200px);
    background-color: #000;
    color: #fff;
  }

  .too-few-imgs > p {
    text-align: center;
  }

  .too-few-imgs-btns {
    display: flex;
    width: 100%;
    justify-content: space-around;
  }

  .too-few-imgs-btns button {
    border: 2px solid white;
    border-radius: 2rem;
    padding: 0.5rem 1rem;
  }
</style>
