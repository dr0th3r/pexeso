<script>
  import { fade } from "svelte/transition";

  import Modal from "./Modal.svelte";
  import CardsOverview from "./CardMenu/CardsOverview.svelte";
  import UpdatePack from "./CardMenu/UpdatePack.svelte";

  export let pexesoPacks;
  export let updatePacks;
  export let choosePack;

  let inPackMenu = false;

  let modifiedPack = null;

  function toggleModal(pack = null) {
    modifiedPack = pack;
    inPackMenu = !inPackMenu;
  }
</script>

<div class="container">
  <CardsOverview {pexesoPacks} {toggleModal} {choosePack} {updatePacks} />
  {#if inPackMenu}
    <Modal>
      <UpdatePack {toggleModal} {updatePacks} {modifiedPack} />
    </Modal>
  {/if}
</div>
