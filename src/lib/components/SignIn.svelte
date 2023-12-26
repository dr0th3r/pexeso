<script>
    let signIn = true;
</script>

<h2>{signIn ? "Sign In" : "Sign Up"}</h2>
<input type="email" placeholder="Username" name="username" required>
<input type="password" placeholder="Password" name="password" minlength="6">
{#if !signIn}
    <input type="password" placeholder="Confirm password" name="confirm_password" minlength="6">
{/if}
<button>{signIn ? "Sign In" : "Sign Up"}</button>
{#if signIn}
    <span>Don't have an account? <a href="#" on:click={() => signIn = false}>Sign Up</a></span>
{:else}
    <span>Already have an account? <a href="#" on:click={() => signIn = true}>Sign In</a></span>
{/if}

<style>
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
</style>
