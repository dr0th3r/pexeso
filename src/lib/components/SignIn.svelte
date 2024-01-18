<script lang="ts">
  import { authStore, authHandlers } from "../stores/auth";

  import { createDBUserTemplate, userData } from "../stores/userData";

  import stateMachine from "../stores/state";

  import defaultPacks from "../defaultPacks";

  $: console.log($authStore.loading);

  let signIn = true;

  let errMsg = "";

  $: if ($authStore.error) {
    errMsg = $authStore.error;
  }

  async function handleSubmit(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);

    if (!formData) {
      errMsg = "Something went wrong! Please try again later";
      return;
    }

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm_password = formData.get("confirm_password") as string;
    const merge_stats = formData.get("merge_stats");
    const merge_packs = formData.get("merge_packs");

    if (!email) {
      errMsg = "You must provide a email!";
    } else if (!password) {
      errMsg = "You must provide a password!";
    } else if (!signIn && password !== confirm_password) {
      errMsg = "Passwords don't match!";
    } else if (!signIn && username?.length <= 3) {
      errMsg = "Username must be at least 3 characters long!";
    } else {
      let newData = createDBUserTemplate(username);

      if (merge_stats) {
        newData = {
          ...newData,
          gamesPlayed: $userData.gamesPlayed,
          leastCardsFlipped: $userData.leastCardsFlipped,
          mostFoundInRow: $userData.mostFoundInRow,
        };
      }

      if (merge_packs) {
        newData = {
          ...newData,
          packs: $userData.packs.filter((pack) =>
            defaultPacks.some(
              (defaultPack) => String(defaultPack?.id) !== pack?.id
            )
          ),
        };
      }

      authHandlers[signIn ? "signIn" : "signUp"](
        email,
        password,
        newData,
        $userData.displayName
      );
    }
  }
</script>

<form
  on:submit|preventDefault={handleSubmit}
  style:filter={$authStore.loading ? "brightness(0.8);" : ""}
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
  {#if !$authStore?.user && $userData?.gamesPlayed > 0}
    <label>
      <input type="checkbox" name="merge_stats" />
      Merge statistics
    </label>
  {/if}
  {#if !$authStore?.user && $userData?.packs?.length > defaultPacks?.length}
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
