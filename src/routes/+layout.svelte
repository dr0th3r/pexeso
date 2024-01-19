<script lang="ts">
  import Header from "../lib/components/Header.svelte";
  import Loading from "../lib/components/Loading.svelte";

  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$lib/stores/auth";

  import { getDoc, doc } from "firebase/firestore";

  import { userData } from "$lib/stores/userData";
  import { usersRef } from "../lib/firebase/firebase.client";

  import { loadingStore } from "../lib/stores/loading";

  import { io } from "socket.io-client";

  import { socketStore } from "$lib/stores/socket";

  const socket = io();

  socketStore.set(socket);

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log(user);

      authStore.update((curr) => ({
        ...curr,
        user: user,
        loading: false,
        error: null,
      }));

      if (user === null) {
        userData.createNewUser();
      } else {
        let loadingTimeout = setTimeout(() => {
          loadingStore.startLoading("Loading user data...");
        }, 3000); //if it takes longer than 3s to load user data, show loading screen

        const userDoc = await getDoc(doc(usersRef, user.uid));

        if (userDoc.exists()) {
          userData.setFromDBData(userDoc.data());
        }

        clearTimeout(loadingTimeout);

        if ($loadingStore.isLoading) {
          //if the timeout was shown, show 100% and close after .5s
          loadingStore.stopLoading();
        }
      }

      return unsubscribe;
    });
  });
</script>

<svelte:head>
  <title>Pexeso</title>
  <meta name="description" content="Pexeso game" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/1.png" />
</svelte:head>
<Header />
<div class="slot-container">
  <slot />
</div>
{#if $loadingStore.isLoading}
  <Loading />
{/if}

<style>
  .slot-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;
  }
</style>
