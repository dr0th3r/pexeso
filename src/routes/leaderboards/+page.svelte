<script>
    let userData = [ //temproray data, not real, will be replaced once DB is added
        {
            username: "dr0th3r",
            solved: 14,
            maxInRow: 4,
        }, 
        {
            username: "cupomaz",
            solved: 10,
            maxInRow: 6
        }
    ] 
    
    let lastSorted = ["username", true]; //default

    function handleSort(type) { //function with side effects
        [userData, lastSorted] = sortUserData(userData, type, lastSorted);
    }

    function sortUserData(userData, type, lastSorted) {
        userData = userData.sort((a, b) => {
            return (a[type] > b[type]) ? 1 : -1
        });
        !lastSorted[1] && (userData = userData.reverse());

        lastSorted = calculateLastSorted(type, ...lastSorted);

        return [userData, lastSorted];
    }

    function calculateLastSorted(newType, oldType, oldAscending) {
        if (oldType === newType) {
            return [newType, !oldAscending];
        } else {
            return [newType, true];
        }
    }

    handleSort("username");
</script>

<table>
    <tr>
        <th on:click={() => {handleSort("username")}}>User</th>
        <th on:click={() => {handleSort("solved")}}>Pexesos solved</th>
        <th on:click={() => {handleSort("maxInRow")}}>Max found in a row</th>
    </tr>
    {#each userData as user} 
        <tr>
            <td>{user.username}</td>
            <td>{user.solved}</td>
            <td>{user.maxInRow}</td>
        </tr>
    {/each}
</table>



<style>
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
        padding: 0.3rem;
    }
</style>