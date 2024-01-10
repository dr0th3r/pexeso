<script>
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

  const socket = io();

  socket?.on("error", (err) => {
    alert(`Error: ${err}`);
  });

  socket?.on("start game", (data) => {
    lobbyInfo = data;
    stateMachine.emit({ type: "startMultiplayer" });

    console.log(lobbyInfo);
  });

  socket?.on("show stats", (players) => {
    lobbyInfo.players = players;
    lobbyInfo = lobbyInfo;
    stateMachine.emit({ type: "showStatistics" });

    console.log(lobbyInfo);
  });

  socket?.on("set stats", (stats) => {
    $userData.leastCardsFlipped = stats.leastCardsFlipped;
    $userData.gamesPlayed = stats.gamesPlayed;
    $userData.mostFoundInRow = stats.mostFoundInRow;
  });

  socket.on("delete lobby", () => {
    lobbyInfo = null;
    stateMachine.emit({ type: "goToMainMenu" });
  });

  socket.on("you left lobby", () => {
    lobbyInfo = null;
    stateMachine.emit({ type: "goToMainMenu" });
  });  
  
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

<Header {socket}/>
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
