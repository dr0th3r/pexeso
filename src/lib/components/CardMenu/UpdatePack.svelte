<script lang="ts">
  import { authStore } from "../../stores/auth";
  import { userData } from "../../stores/userData";
  import { db } from "../../firebase/firebase.client";
  import { doc, updateDoc } from "firebase/firestore";
  import { storage } from "../../firebase/firebase.client";
  import {
    uploadBytes,
    getDownloadURL,
    ref,
    deleteObject,
    type FirebaseStorage,
    type StorageReference,
    type UploadResult,
  } from "firebase/storage";

  import Compressor from "compressorjs";
  import { loadingStore } from "../../stores/loading";

  let currImgUrls = $userData?.modifiedPack?.imgUrls || [];
  let currImgRefPaths = $userData?.modifiedPack?.imgRefPaths || [];

  let newImgs: File[] = [];

  let removedImgPositions: number[] = [];

  $: newImgUrls = newImgs.map((img) => URL.createObjectURL(img));
  $: currFilteredImgUrls = currImgUrls.filter(
    (_, i) => !removedImgPositions.includes(i)
  ); //imgs that weren't deleted

  let newPackTitle = $userData?.modifiedPack?.title || "";

  console.log($userData.modifiedPack, newPackTitle);

  let errorMsg = "";

  function handleClose() {
    $userData.modifiedPack = null;
  }

  function handleImgUpload(e: Event) {
    const target = e.target as HTMLInputElement;

    if (target?.files) {
      newImgs = [...newImgs, ...target.files];
    }
  }

  function removeImg(i: number, isNew: boolean) {
    if (isNew) {
      newImgs.splice(i, 1);
      newImgs = newImgs;
    } else {
      removedImgPositions = [...removedImgPositions, i];
    }
  }

  async function savePack() {
    if (newPackTitle === "") {
      //alert("You must provide pack name!");
      errorMsg = "You must provide pack name!";
      return;
    } else if (currFilteredImgUrls?.length + newImgs.length <= 1) {
      //alert("Your pack must have at least 2 different images!");
      errorMsg = "Your pack must have at least 2 different images!";
      return;
    }

    let packId;

    if ($userData?.modifiedPack?.id) {
      packId = $userData.modifiedPack.id;

      try {
        await removeImgsFromDB(currImgRefPaths, removedImgPositions);
        const [imgUrls, imgRefPaths] = await uploadImgs(
          String(packId),
          newImgs
        );

        const updatedImgUrls = imgUrls.concat(currFilteredImgUrls);

        const updatedImgRefPaths = imgRefPaths.concat(
          currImgRefPaths.filter((_, i) => !removedImgPositions.includes(i))
        );

        if ($authStore.user) {
          await updateUserProfile(
            String(packId),
            updatedImgUrls,
            updatedImgRefPaths,
            newPackTitle
          );
        }

        $userData.modifiedPack.title = newPackTitle;
        $userData.modifiedPack.imgUrls = updatedImgUrls;
        $userData.modifiedPack.imgRefPaths = updatedImgRefPaths;
      } catch (error) {
        console.error(error);
      }
    } else {
      packId = crypto.randomUUID();

      const [imgUrls, imgRefPaths] = await uploadImgs(packId, newImgs);

      console.log(imgUrls, imgRefPaths);

      if ($authStore.user) {
        await updateUserProfile(packId, imgUrls, imgRefPaths, newPackTitle);
      }

      $userData.packs = [
        ...$userData.packs,
        {
          id: packId,
          title: newPackTitle,
          imgUrls: imgUrls,
          imgRefPaths: imgRefPaths,
        },
      ];
    }

    errorMsg = "";
    $userData.modifiedPack = null;
  }

  async function removeImgsFromDB(imgRefPaths: string[], positions: number[]) {
    try {
      const posCount = positions.length;

      loadingStore.startLoading("Removing images...");
      await Promise.all(
        positions.map((pos, i) => {
          loadingStore.updateProgress((i + 1) / posCount);
          deleteObject(ref(storage, imgRefPaths[pos]));
        })
      );

      loadingStore.stopLoading();
    } catch (error) {
      console.error(error);
    }
  }

  async function compressAndUploadImg(
    img: File,
    packRef: StorageReference,
    updateProgress: () => void
  ): Promise<UploadResult> {
    const compressionOptions = {
      quality: 0.6,
      maxWidth: 500,
      maxHeight: 500,
    };

    return new Promise(async (resolve, reject) => {
      try {
        new Compressor(img, {
          ...compressionOptions,
          success: async (compressedImg) => {
            const snapshot = await uploadBytes(
              ref(packRef, img.name),
              compressedImg
            );
            updateProgress();
            resolve(snapshot);
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          reject(`Error compressing image ${img.name}: ${error.message}`);
        } else {
          reject(`Error compressing image ${img.name}: ${error}`);
        }
      }
    });
  }

  async function uploadImgs(packId: string, imgs: File[]) {
    try {
      const packRef = ref(
        storage,
        `packs/${$authStore?.user?.uid || $userData.displayName}/${packId}`
      ); //if there is no user, than the displayName is "anonymous<some-id>"

      const imgCount = imgs.length;
      let uploadedCount = 0;

      loadingStore.startLoading("Uploading images...");

      const snapshots = await Promise.all(
        imgs.map((img) =>
          compressAndUploadImg(img, packRef, () => {
            loadingStore.updateProgress(++uploadedCount / imgCount);
          })
        )
      );

      if (!snapshots?.length) throw new Error("No snapshots");

      loadingStore.stopLoading();

      const snapshotRefPaths = snapshots.map(
        (snapshot) => snapshot.ref.fullPath
      );

      loadingStore.startLoading("Getting image URLs...");

      //not necessary updating progress because it's super fast
      const snapshotUrls = await Promise.all(
        snapshots.map((snapshot) => getDownloadURL(snapshot.ref))
      );

      loadingStore.stopLoading();

      return [snapshotUrls, snapshotRefPaths];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function updateUserProfile(
    packId: string,
    imgUrls: string[],
    imgRefPaths: string[],
    title: string
  ) {
    try {
      const newData = {
        [`packs.${packId}`]: {
          title: title,
          imgUrls: imgUrls,
          imgRefPaths: imgRefPaths,
        },
      };

      console.log(newData);

      loadingStore.startLoading("Updating user profile...");

      await updateDoc(doc(db, "users", $authStore.user.uid), newData);

      loadingStore.stopLoading();
    } catch (error) {
      console.error(error);
    }
  }
</script>

<header>
  <h2>Creating New Set</h2>
  <button class="close-btn" on:click={handleClose}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.1rem"
      height="1.1rem"
      viewBox="0 0 24 24"
      ><path
        fill="var(--text)"
        d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
      /></svg
    ></button
  >
</header>
<main>
  <div class="inputs">
    <input
      class="pack-name-input"
      type="text"
      placeholder="Pack name..."
      bind:value={newPackTitle}
    />

    <div class="right">
      <label for="upload-img">Upload Image</label>
      <input
        class="file-input"
        type="file"
        id="upload-img"
        name="upload-img"
        accept="image/png"
        multiple
        aria-multiselectable
        on:change={handleImgUpload}
      />
      <button class="save-btn" on:click={savePack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.1rem"
          height="1.1rem"
          viewBox="0 0 1024 1024"
          ><path
            fill="var(--text)"
            d="M77.248 415.04a64 64 0 0 1 90.496 0l226.304 226.304L846.528 188.8a64 64 0 1 1 90.56 90.496l-543.04 543.04l-316.8-316.8a64 64 0 0 1 0-90.496"
          /></svg
        >
        <span class="tooltip">Save</span>
      </button>
    </div>
    {#if errorMsg !== ""}
      <p class="error-msg">{errorMsg}</p>
    {/if}
  </div>
</main>
<div class="cards">
  {#each currFilteredImgUrls as imgUrl, i (i)}
    <button class="card" on:click={() => removeImg(i, false)}>
      <img src={imgUrl} alt="card preview" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        ><path
          fill="var(--text)"
          d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
        /></svg
      >
    </button>
  {/each}
  {#each newImgUrls as imgUrl, i (i)}
    <button class="card" on:click={() => removeImg(i, true)}>
      <img src={imgUrl} alt="card preview" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        ><path
          fill="var(--text)"
          d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
        /></svg
      >
    </button>
  {/each}
</div>

<style>
  header {
    display: flex;
    align-items: center;
  }

  h2 {
    font-size: 1.5rem;
  }

  button {
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .save-btn,
  .close-btn {
    width: calc(
      calc(1.1rem * 1.2) + 1rem + 2px
    ); /* (icon_size * line-height) + padding + border */
    height: calc(calc(1.1rem * 1.2) + 1rem + 2px);
  }

  .close-btn {
    margin-left: auto;
  }

  .close-btn:hover {
    background-color: var(--primary);
  }

  .error-msg {
    color: var(--error);
    font-size: 1.1rem;
  }

  .inputs,
  .right {
    display: flex;
    align-items: center;
  }

  .inputs {
    margin-top: 0.8rem;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .right {
    gap: 0.4rem;
  }

  .right,
  label,
  .pack-name-input {
    flex: 1;
  }

  .pack-name-input,
  label {
    box-sizing: border-box;
    padding: 0.5rem;
    font-size: 1.1rem;
    border: 1px solid var(--primary);
    outline: none;
    border-radius: 8px;
    background-color: transparent;
    color: var(--text);
  }

  label {
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease-out;
  }

  label:hover {
    background-color: var(--primary);
  }

  .file-input {
    display: none;
  }

  .save-btn {
    position: relative;
    border: 1px solid var(--success);
    transition: all 0.3s ease-out;
  }

  .save-btn:hover {
    background-color: var(--success);
  }

  button:hover .tooltip {
    visibility: visible;
  }

  .cards {
    margin-top: 0.8rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 10px;
  }

  .card,
  .card svg,
  .card img {
    transition: all 0.3s ease-out;
  }

  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
  }

  .card svg {
    z-index: 9999;
    position: absolute;
    display: none;
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: fill;
    border-radius: 8px;
  }

  .card:hover {
    background-color: var(--error);
    border: 1px solid var(--error);
  }

  .card:hover img {
    opacity: 0;
  }

  .card:hover svg {
    display: block;
  }
</style>
