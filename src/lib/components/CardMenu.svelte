<script lang="ts">
  import { fade } from "svelte/transition";

  import {userData} from "$lib/stores/userData";

  import Modal from "./Modal.svelte";
  import CardsOverview from "./CardMenu/CardsOverview.svelte";
  import UpdatePack from "./CardMenu/UpdatePack.svelte";
</script>

<div class="container">
  <CardsOverview/>
  {#if $userData.modifiedPack}
    <Modal>
      <UpdatePack/>
    </Modal>
  {/if}
</div>