<script lang="ts">
  import MainMenu from "$lib/components/MainMenu.svelte";
  import SignIn from "$lib/components/SignIn.svelte";
  import Gameboard from "$lib/components/Gameboard.svelte";
  import CardMenu from "$lib/components/CardMenu.svelte";

  import { fade } from "svelte/transition";

  import state from "$lib/stores/state";

  import { onMount } from "svelte";
  import Stats from "$lib/components/Stats.svelte";
  import LobbyMenu from "$lib/components/LobbyMenu.svelte";
  import { socketStore } from "$lib/stores/socket";
  import userData from "$lib/stores/userData";
  import type { ClientUser } from "$lib/types";

  let transitionComplete = true;
  
  const unsubscribe = state.subscribe(() => {
    transitionComplete = false;
    setTimeout(() => {
      transitionComplete = true;
    }, 300);
  });

  onMount(() => {
    return unsubscribe;
  });

  $: if (!$userData?.socketId && $socketStore && $socketStore.id) {
    userData.update(curr => ({
      ...curr,
      socketId: $socketStore!.id
    } as ClientUser))
  }
</script>

{#if $state === "in main menu" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <MainMenu />
  </div>
{:else if $state === "in signin menu" && transitionComplete}
  <div transition:fade={{ duration: 300 }}>
    <SignIn />
  </div>
{:else if $state === "playing singleplayer" && transitionComplete}
  <Gameboard multiplayer={false}/>
{:else if $state === "playing multiplayer" && transitionComplete}
  <Gameboard multiplayer={true}/>
{:else if $state === "showing statistics" && transitionComplete}
  <Stats />
{:else if $state === "in lobby menu" && transitionComplete}
  <LobbyMenu />
{:else if $state === "in pack menu" && transitionComplete}
  <CardMenu />
{/if}

<style>
  :global(body) {
    height: 100vh;
  }

  div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    position: relative;
  }
</style>
