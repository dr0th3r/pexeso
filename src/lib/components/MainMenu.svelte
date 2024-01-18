<script lang="ts">
  import stateMachine from "$lib/stores/state";
</script>

<button on:click={() => stateMachine.emit({ type: "startSingleplayer" })}
  >Singleplayer</button
>
<button on:click={() => stateMachine.emit({ type: "goToLobbyMenu" })}
  >Multiplayer</button
>
<button on:click={() => stateMachine.emit({ type: "goToCardMenu" })}
  >Manage Packs</button
>
<button on:click={() => stateMachine.emit({ type: "goToLeaderboards" })}
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
