<script>
  export let imgUrl;
  export let flipped;
  export let found;

  //console.log(imgUrl);
</script>

<button
  on:click
  disabled = {flipped || found}
  class="card"
  class:flipped = {flipped || found}
>
  <div 
    class="img-container"
    class:found
  >
    <img src={imgUrl} alt="card"/>
  </div>
</button>

<style>
  .card {
    height: 150px;
    width: 150px;
    cursor: pointer;
    background-color: #222;
    border: none;
    border-radius: 20px;
    rotate: y 0deg;
    transition: rotate 0.3s ease-out;
    transform-style: preserve-3d;
    border: 2px solid rgba(255, 255, 255, 0.65);

    &.flipped {
      rotate: y 180deg;
    }
  }

  .img-container {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    backface-visibility: hidden;
    rotate: y 180deg;

    &.found {
      opacity: 0.6;
      cursor: initial;
    }
  }

  img {
    width: 130px;
    height: 130px;
    -webkit-user-drag: none;
  }

</style>
