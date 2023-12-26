<script>
</script>

<div class="outer">
  <div class="inner">
    <slot />
  </div>
</div>

<style>
  .outer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: brightness(60%);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inner {
    box-sizing: border-box;
    padding: 1rem;
    width: 25vw;
    height: 75vh;
    background-color: #fff;
    border-radius: 8px;
    background-color: var(--bg);
    color: #f0f0f0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease-out;
  }

  .inner:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
</style>
