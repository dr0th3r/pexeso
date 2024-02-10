<script lang="ts">
  import { auth, db } from "$lib/firebase/firebase.client"

  import { onAuthStateChanged } from "firebase/auth";
  
  import Header from "$lib/components/Header.svelte";
  import { getDoc, doc } from "firebase/firestore";
  import userData from "$lib/stores/userData";
  import type { ClientUser, DBUser } from "$lib/types";

  import { io } from "socket.io-client";

  import { socketStore } from "$lib/stores/socket";

  const socket = io();

  let socketId = "";

  socket.on("connect", () => {
    if (socket.id) {
      socketId = socket.id;
      socketStore.set(socket);
    }

    if ($userData) {
      userData.update(curr => ({
        ...curr,
        socketId: socket.id
      } as ClientUser));
    }
  });


  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        userData.setFromDB(userDoc.data() as DBUser, user.uid);
      } else {
        console.log("No such document!");
      }
    } else {
      userData.reset();
    }


    if (socketId) {
      userData.update(curr => ({
        ...curr,
        socketId
      } as ClientUser));
    }
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

<style>
  .slot-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;
  }
</style>
