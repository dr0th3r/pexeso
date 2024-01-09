<script>
  import { authStore } from "../stores/auth";

  import { fly, fade } from "svelte/transition";

  import stateMachine from "$lib/stores/state";
</script>

<button
  in:fly={{ y: 200, duration: 2000 }}
  out:fade={{ duration: 500 }}
  on:click={() => stateMachine.emit({ type: "startSingleplayer" })}
  >Singleplayer</button
>
<button
  on:click={() => stateMachine.emit({ type: "goToLobbyMenu" })}
  in:fly={{ y: 200, duration: 2000, delay: 100 }}
  out:fade={{ duration: 500 }}
  >Multiplayer</button

>
<button
  in:fly={{ y: 200, duration: 2000, delay: 200 }}
  out:fade={{ duration: 500 }}
  on:click={() => stateMachine.emit({ type: "goToCardMenu" })}
  >Manage Packs</button
>
<a
  href="/leaderboards"
  in:fly={{ y: 200, duration: 2000, delay: 300 }}
  out:fade={{ duration: 500 }}
>
  <button>Leaderboards</button>
</a>

<style>
  button {
    width: clamp(150px, 60vw, 250px);
    font-size: 1.5rem;
    padding: 1rem 2rem;
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

  a {
    color: #f0f0f0;
    text-decoration: none;
  }
</style>
