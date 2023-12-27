<script>
    import { authStore, authHandlers } from "../stores/auth";

    import { userData } from "../stores/userData";
    
    import stateMachine from "../stores/state";
    
    $: if ($authStore.user) {
        stateMachine.emit({ type: "goToMainMenu" });
    }

    $: console.log($authStore.loading);

    let signIn = true;

    let errMsg = "";

    $: if ($authStore.error) {
        errMsg = $authStore.error;
    }

    async function handleSubmit(e) {
        
        const formData = new FormData(e.target);

        if (!formData) {
            errMsg = "Something went wrong! Please try again later";
            return;
        }

        const email = formData.get("email");
        const password = formData.get("password");
        const confirm_password = formData.get("confirm_password");

        if (!email) {
            errMsg = "You must provide a email!";
            return;
        } else if (!password) {
            errMsg = "You must provide a password!";
            return;
        } else if (!signIn && password !== confirm_password) {
            errMsg = "Passwords don't match!";
            return;
        } else {
            errMsg = "";
            authHandlers[signIn ? "signIn" : "signUp"](email, password);
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} style:filter={$authStore.loading && "brightness(0.8);"}>
    <h2>{signIn ? "Sign In" : "Sign Up"}</h2>
    <input type="email" placeholder="Email" name="email" required>
    <input type="password" placeholder="Password" name="password" minlength="6" required>
    {#if !signIn}
        <input type="password" placeholder="Confirm password" name="confirm_password" minlength="6" required>
    {/if}
    <button>{signIn ? "Sign In" : "Sign Up"}</button>
    {#if signIn}
        <span>Don't have an account? <a href="#" on:click={() => signIn = false}>Sign Up</a></span>
    {:else}
        <span>Already have an account? <a href="#" on:click={() => signIn = true}>Sign In</a></span>
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
        color: #f0f0f0;
        width: 100%;
    }


    button {
        padding: 0.5rem;
        color: #f0f0f0;
        background-color: transparent;
        border-radius: 8px;
        border: 1px solid var(--primary);
        cursor: pointer;
        font-size: 1.1rem;
        width: 100%;
        transition: all 0.3s ease-out;
    }

    button:hover {
        background-color: var(--primary);
    }

    h2 {
        margin-bottom: 0.2rem;
    }

    h2, span {
        color: #f0f0f0;
    }

    a {
        color: var(--primary);
    }

    .err-msg {
        color: var(--error);
    }
</style>
