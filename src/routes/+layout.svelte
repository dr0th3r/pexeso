<script>
  import Header from "../lib/components/Header.svelte";

  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$lib/stores/auth";

  import { userData, createUserTemplate } from "$lib/stores/userData";
  import defaultPacks from "../lib/defaultPacks";

  import { db } from "$lib/firebase/firebase.client";
  import { getDoc, doc, setDoc } from "firebase/firestore";

  import stateMachine from "$lib/stores/state.js";
  import { updateProfile } from "firebase/auth";
  import { usersRef } from "../lib/firebase/firebase.client";

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
