<script>
  import Modal from "../Modal.svelte";

  export let toggleModal;
  export let modifiedPack;
  export let updatePacks;

  let newPackTitle = modifiedPack?.title || "";
  let newPackImgs = modifiedPack?.imgUrls || [];

  let errorMsg = "";

  function handleImgUpload(e) {
    newPackImgs = [
      ...newPackImgs,
      ...Array.from(e.target.files).map((file) => URL.createObjectURL(file)),
    ];
  }

  function removeImg(id) {
    newPackImgs.splice(id, 1);
    newPackImgs = newPackImgs; //to reload
  }

  function savePack() {
    if (newPackTitle === "") {
      alert("You must provide pack name!");
      errorMsg = "You must provide pack name!";
      return;
    } else if (newPackImgs.length <= 1) {
      alert("Your pack must have at least 2 different images!");
      errorMsg = "Your pack must have at least 2 different images!";
      return;
    }

    if (modifiedPack?.id) {
      updatePacks((prev) =>
        prev.map((pack) => {
          if (pack.id === modifiedPack?.id) {
            return {
              id: pack.id,
              title: newPackTitle,
              imgUrls: newPackImgs,
            };
          } else {
            return pack;
          }
        })
      );
    } else {
      updatePacks((prev) => [
        ...prev,
        {
          id: prev.length,
          title: newPackTitle,
          imgUrls: newPackImgs,
        },
      ]);
    }

    errorMsg = "";
    toggleModal();
  }
</script>

<header>
  <h2>Creating New Set</h2>
  <button class="close-btn" on:click={toggleModal}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.1rem"
      height="1.1rem"
      viewBox="0 0 24 24"
      ><path
        fill="#f0f0f0"
        d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
      /></svg
    ></button
  >
</header>
<main>
  <div class="inputs">
    <input
      class="pack-name-input"
      type="text"
      placeholder="Pack name..."
      bind:value={newPackTitle}
    />

    <div class="right">
      <label for="upload-img">Upload Image</label>
      <input
        class="file-input"
        type="file"
        id="upload-img"
        name="upload-img"
        accept="image/png"
        multiple
        aria-multiselectable
        on:change={handleImgUpload}
      />
      <button class="save-btn" on:click={savePack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.1rem"
          height="1.1rem"
          viewBox="0 0 1024 1024"
          ><path
            fill="#f0f0f0"
            d="M77.248 415.04a64 64 0 0 1 90.496 0l226.304 226.304L846.528 188.8a64 64 0 1 1 90.56 90.496l-543.04 543.04l-316.8-316.8a64 64 0 0 1 0-90.496"
          /></svg
        >
        <span class="tooltip">Save</span>
      </button>
    </div>
    {#if errorMsg !== ""}
      <p class="error-msg">{errorMsg}</p>
    {/if}
  </div>
</main>
<div class="cards">
  {#each newPackImgs as imgUrl, id (id)}
    <button class="card" on:click={() => removeImg(id)}>
      <img src={imgUrl} alt="card preview" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        ><path
          fill="#f0f0f0"
          d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
        /></svg
      >
    </button>
  {/each}
</div>

<style>
  header {
    display: flex;
    align-items: center;
  }

  h2 {
    font-size: 1.5rem;
  }

  button {
    background-color: transparent;
    color: #f0f0f0;
    border: 1px solid var(--primary);
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s all ease-out;
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .save-btn,
  .close-btn {
    width: calc(
      calc(1.1rem * 1.2) + 1rem + 2px
    ); /* (icon_size * line-height) + padding + border */
    height: calc(calc(1.1rem * 1.2) + 1rem + 2px);
  }

  .close-btn {
    margin-left: auto;
  }

  .close-btn:hover {
    background-color: var(--primary);
  }

  .error-msg {
    color: var(--error);
    font-size: 1.1rem;
  }

  .inputs,
  .right {
    display: flex;
    align-items: center;
  }

  .inputs {
    margin-top: 0.8rem;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .right {
    gap: 0.4rem;
  }

  .right,
  label,
  .pack-name-input {
    flex: 1;
  }

  .pack-name-input,
  label {
    box-sizing: border-box;
    padding: 0.5rem;
    font-size: 1.1rem;
    border: 1px solid var(--primary);
    outline: none;
    border-radius: 8px;
    background-color: transparent;
    color: #f0f0f0;
  }

  label {
    cursor: pointer;
    text-align: center;
  }

  .file-input {
    display: none;
  }

  .save-btn {
    position: relative;
    border: 1px solid var(--success);
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
    bottom: 120%;
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

  .cards {
    margin-top: 0.8rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 10px;
  }

  .card,
  .card svg,
  .card img {
    transition: all 0.3s ease-out;
  }

  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
  }

  .card svg {
    z-index: 9999;
    position: absolute;
    display: none;
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: fill;
    border-radius: 8px;
  }

  .card:hover {
    background-color: var(--error);
    border: 1px solid var(--error);
  }

  .card:hover img {
    opacity: 0;
  }

  .card:hover svg {
    display: block;
  }
</style>
