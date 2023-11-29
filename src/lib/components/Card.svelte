<script>
  export let imgUrl;
  export let flipped;
  export let found;

  //console.log(imgUrl);
</script>

<div>
  {#if !found}
    <button on:click disabled={flipped}>
      <img src={imgUrl} alt="test" style:display={flipped ? "block" : "none"} />
    </button>
  {:else}
    <p>found</p>
  {/if}
</div>

<style>
  div,
  button {
    height: 150px;
    width: 150px;
    border-radius: 20px;
  }

  div {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div,
  button:hover {
    cursor: pointer;
  }

  button,
  button:focus,
  button:active {
    border: none;
    background: none;
    outline: none;
    padding: 0;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid rgba(255, 255, 255, 0.65);
  }

  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    width: 90%;
    height: 90%;
  }
</style>
