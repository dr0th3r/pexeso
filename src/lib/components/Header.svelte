<script>
  import { authStore, authHandlers } from "../stores/auth";
  
  import stateMachine from "../stores/state";
</script>

<nav>
  <h1>
    <a href="/" on:click={() => stateMachine.emit({ type: "goToMainMenu" })}>
      Pexeso
    </a>
  </h1>
  <button class="profile-img-placeholder"
    on:click={() => {
      if ($authStore.user) {
        authHandlers.logOut();
      } else {
        stateMachine.emit({ type: "goToSignInMenu", user: $authStore.user })
      }
    }}
  >{$authStore.user ? "Log Out" : "Sign In"}</button>
</nav>

<style>
  nav {
    padding: 0.8rem 2rem;
    display: flex;
    align-items: center;
  }

  h1,
  a {
    text-decoration: none;
    color: #f0f0f0;
    cursor: pointer;
    font-size: 2rem;
  }

  button {
    margin-left: auto;
    padding: 0.5rem;
    border: 1px solid var(--primary);
    border-radius: 8px;
    background-color: transparent;
    color: #f0f0f0; 
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease-out;
  }

  button:hover {
    background-color: var(--primary);
  }

/*   .profile-img-placeholder {
    border: none;
    outline: none;
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 100%;
    margin-left: auto;
    background-color: var(--secondary);
    cursor: pointer;
  } */

</style>
