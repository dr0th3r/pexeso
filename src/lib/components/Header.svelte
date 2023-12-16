<script>
  import stateMachine from "../stores/state";
</script>

<nav>
  <h1>
    <a href="/" on:click={() => stateMachine.emit({ type: "goToMainMenu" })}>
      Pexeso
    </a>
  </h1>
  <div class="profile-img-placeholder"></div>
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

  .profile-img-placeholder {
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 100%;
    margin-left: auto;
    background-color: var(--secondary);
    cursor: pointer;
  }
</style>
