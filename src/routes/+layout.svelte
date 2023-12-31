<script>
  import Header from "../lib/components/Header.svelte";

  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$lib/stores/auth";

  import { getDoc, doc } from "firebase/firestore";

  import { userData } from "$lib/stores/userData";
  import { usersRef } from "../lib/firebase/firebase.client";

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log(user);

      authStore.update((curr) => {
        return {
          ...curr,
          isLoading: false,
          user: user,
        };
      });

      if (user === null) {
        userData.createNewUser();
      } else {
        const userDoc = await getDoc(doc(usersRef, user.uid))

        if (userDoc.exists()) {
          userData.setFromDBData(userDoc.data());
        }
      }

      return unsubscribe;
    });
  });
</script>

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
