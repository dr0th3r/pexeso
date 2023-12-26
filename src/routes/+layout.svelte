<script>
  import Header from "../lib/components/Header.svelte";

   import { onMount } from "svelte";
    import {auth} from "$lib/firebase/firebase.client"
    import {authStore} from "$lib/stores/auth"

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            console.log(user);
            authStore.update(curr => {
                return {
                    ...curr,
                    isLoading: false,
                    user: user
                }
            })
        })

        return unsubscribe;
    }) 
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
  }
</style>
