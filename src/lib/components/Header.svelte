<script>
  import { logOut } from "$lib/firebase/auth";
  import state from "$lib/stores/state";

  import userData from "$lib/stores/userData";
</script>

<nav>
  <h1>
    <button class="logo"
      on:click={() => {
        state.emit({ type: "go to main menu", sendLeaveGame: true });
      }}
    >
      Pexeso
    </button>
  </h1>
  <button
    class="profile-img-placeholder"
    on:click={async () => {
      if ($userData?.dbId) {
        try {
          //we don't have to reset user because it will do so automatically in +layout.svelte in onAuthStateChanged
          await logOut();
        } catch (error) {
          console.log(error);
        }
      } else {
        state.emit({ type: "go to singin menu" });
      }
    }}>{$userData?.dbId ? "Log Out" : "Sign In"}</button
  >
</nav>

<style>
  nav {
    padding: 0.8rem 2rem;
    display: flex;
    align-items: center;
  }

  h1 {
    text-decoration: none;
    color: var(--text);
    cursor: pointer;
    font-size: 2rem;
  }

  .logo {
    font-size: 2rem;
    border: none;
    padding: 0;
    margin: 0;
  }

  .logo:hover {
    background-color: transparent;
  }



  button {
    margin-left: auto;
    padding: 0.5rem;
    font-size: 1.1rem;
  }
</style>
