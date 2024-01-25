<script lang="ts">
  import userData from "$lib/stores/userData";

  import * as auth from "$lib/firebase/auth";

  import defaultPacks from "$lib/defaultPacks";
  import state from "$lib/stores/state";

  let signIn = true;

  let errMsg = "";

  function handleSubmit(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);

    const { email, password, username, confirm_password } = Object.fromEntries(
      formData.entries()
    ) as {
      email: string;
      password: string;
      username: string | undefined;
      confirm_password: string | undefined;
    };

    if (signIn) {
      auth.signIn(null, email, password);
    } else if (username && password && password === confirm_password) {
      auth.signUp({
        ...userData.createTemplate(),
        name: username
      }, email, password);
    }

    state.emit({ type: "go to main menu" });
  }
</script>

<form
  on:submit|preventDefault={handleSubmit}
>
  <h2>{signIn ? "Sign In" : "Sign Up"}</h2>
  {#if !signIn}
    <input
      type="text"
      placeholder="Username"
      name="username"
      minlength="3"
      required
    />
  {/if}
  <input type="email" placeholder="Email" name="email" required />
  <input
    type="password"
    placeholder="Password"
    name="password"
    minlength="6"
    required
  />
  {#if !signIn}
    <input
      type="password"
      placeholder="Confirm password"
      name="confirm_password"
      minlength="6"
      required
    />
  {/if}
  {#if $userData && $userData?.stats?.gamesPlayed > 0}
    <label>
      <input type="checkbox" name="merge_stats" />
      Merge statistics
    </label>
  {/if}
  {#if $userData && $userData?.packs?.length > defaultPacks?.length}
    <label>
      <input type="checkbox" name="merge_packs" />
      Merge packs
    </label>
  {/if}
  <button>{signIn ? "Sign In" : "Sign Up"}</button>
  {#if signIn}
    <span
      >Don't have an account? <a href="#" on:click={() => (signIn = false)}
        >Sign Up</a
      ></span
    >
  {:else}
    <span
      >Already have an account? <a href="#" on:click={() => (signIn = true)}
        >Sign In</a
      ></span
    >
  {/if}
  {#if errMsg}
    <span class="err-msg">{errMsg}</span>
  {/if}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    max-width: 15vw;
  }

  input {
    box-sizing: border-box;
    padding: 0.5rem;
    font-size: 1.1rem;
    border: 1px solid var(--primary);
    outline: none;
    border-radius: 8px;
    background-color: transparent;
    color: var(--text);
    width: 100%;
  }

  label {
    display: flex;
    align-self: flex-start;
    justify-content: flex-start;
    gap: 0.5rem;
    font-size: 1.1rem;
    color: var(--text);
    cursor: pointer;
  }

  label input {
    width: 1rem;
    border: 1px solid var(--primary);
    cursor: pointer;
  }

  button {
    padding: 0.5rem;
    font-size: 1.1rem;
    width: 100%;
  }

  h2 {
    margin-bottom: 0.2rem;
  }

  h2,
  span {
    color: var(--text);
  }

  a {
    color: var(--primary);
  }

  .err-msg {
    color: var(--error);
  }
</style>
