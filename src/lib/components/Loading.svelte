<script lang="ts">
  import { loadingStore } from "$lib/stores/loading";
</script>

<div class="loading">
  <p>{$loadingStore?.message}</p>

  <div class="progress-bar">
    <div class="progress" style="width: {$loadingStore.progress}%"></div>
  </div>
</div>

<style>
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    font-size: 1.5rem;
    color: var(--text);
    background-color: transparent;
    backdrop-filter: brightness(60%);
    backdrop-filter: blur(5px);
    gap: 0.5rem;
  }

  .progress-bar {
    width: clamp(200px, 50%, 500px);
    height: 20px;
    background-color: var(--text);
    border-radius: 10px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background-color: var(--primary);
    transition: width 0.3s ease-out;
  }
</style>
