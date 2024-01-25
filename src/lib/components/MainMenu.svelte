<script lang="ts">
  import state from "$lib/stores/state";
</script>

<button on:click={() => state.emit({ type: "start singleplayer" })}
  >Singleplayer</button
>
<button on:click={() => state.emit({ type: "go to lobby menu" })}
  >Multiplayer</button
>
<button on:click={() => state.emit({ type: "go to pack menu" })}
  >Manage Packs</button
>
<button on:click={() => state.emit({ type: "goToLeaderboards" })}
  >Leaderboards</button
>

<style>
  button {
    width: clamp(150px, 60vw, 250px);
    font-size: 1.5rem;
    padding: 1rem 2rem;
    border-width: 2px;
  }
</style>
