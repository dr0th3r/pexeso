<script lang="ts">
  import type { ClientPack } from "$lib/types";
    import CardsOverview from "./CardMenu/CardsOverview.svelte";
  import UpdatePack from "./CardMenu/UpdatePack.svelte";
  import Modal from "./Modal.svelte";

    let modifiedPack: ClientPack | null = null;

    function modifyPack(cb: (pack: ClientPack | null) => ClientPack | null) {
        modifiedPack = cb(modifiedPack);
    }
</script>

<div>
    <CardsOverview {modifyPack}/>
    {#if modifiedPack}
        <Modal>
            <UpdatePack {modifiedPack} {modifyPack} handleClose={() => {
                modifiedPack = null;
            }}/>
        </Modal>
    {/if}
</div>

<style>
    div {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }  
</style>