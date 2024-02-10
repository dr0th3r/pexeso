<script lang="ts">
  import { db, storage } from "$lib/firebase/firebase.client";
  import userData from "$lib/stores/userData";
    import type { ClientPack, Pack } from "$lib/types";
    import Compressor from "compressorjs";
  import { doc, updateDoc } from "firebase/firestore";
  import { ref, uploadBytes, type StorageReference, getDownloadURL, deleteObject } from "firebase/storage";

    export let modifiedPack: ClientPack | null
    export let modifyPack: (cb: (pack: ClientPack | null) => ClientPack | null) => void

    export let handleClose: () => void

    const compressionOptions = {
      quality: 0.6,
      maxWidth: 500,
      maxHeight: 500,
    };

    $: currImgUrls = modifiedPack?.imgUrls || []

    let newImgs: File[] = []
    $: newImgUrls = newImgs.map(img => URL.createObjectURL(img))

    const removedImgUrls: string[] = []

    let newPackTitle = modifiedPack?.name || ""
    let errorMsg = ""

    function removeImg(i: number, isNew: boolean) {
        if (isNew) {
            newImgs = newImgs.filter((_, index) => index !== i)
        } else {
            removedImgUrls.push(currImgUrls[i])
            modifiedPack!.imgUrls = modifiedPack!.imgUrls.filter((_, index) => index !== i)
        }
    }

    function handleImgUpload(e: Event) {
        const newUploads = (e.target as HTMLInputElement).files
        
        if (newUploads) {
            newImgs = [...newImgs, ...newUploads]
        }
    }

    async function savePack() {
        if (newPackTitle === "") {
            errorMsg = "Please enter a pack name"
            return
        } else if (newImgs.length + (currImgUrls.length - removedImgUrls.length) < 2) {
            errorMsg = "Please upload at least 2 images"
            return
        }

        if (!$userData || !modifiedPack) {
            errorMsg = "Something went wrong, try again later"
            return;
        }

        const packRef = ref(storage, `packs/${$userData.dbId || $userData.name}/${modifiedPack.id}`)

        try {
            const uploadedImgUrls = await compressAndUploadToDB(packRef)
            if (uploadedImgUrls.length === 0) {
                errorMsg = "Error uploading images, please try agian later"
                return;
            }
            await removeImgsFromDB(packRef)
  
            modifiedPack = {
                ...modifiedPack,
                name: newPackTitle,
                imgUrls: [...modifiedPack.imgUrls, ...uploadedImgUrls],
                chosenSize: (modifiedPack.imgUrls.length + uploadedImgUrls.length) * 2
            }

            if ($userData?.dbId) {
                await updateUserPack(modifiedPack)
            }

            const packIndex = $userData.packs.findIndex(pack => pack.id === modifiedPack!.id)

            if (packIndex === -1) {
                $userData.packs = [...$userData.packs, modifiedPack]
            } else {
                $userData.packs[packIndex] = modifiedPack
            }

            handleClose()
        } catch (error) {
            console.log(error);
        }


    }

    function compressAndUploadToDB(packRef: StorageReference): Promise<string[]> {
        return Promise.all(newImgs.map(img => {
            return new Promise<string>(async (res, rej) => {
                try {
                    new Compressor(img, {
                        ...compressionOptions,
                        success: async (compressedImg) => {
                            const imgSnapshot = await uploadBytes(
                                ref(packRef, img.name),
                                compressedImg
                            )
                            const imgUrl = await getDownloadURL(imgSnapshot.ref)
                            res(imgUrl)
                        },
                        error: (error) => {
                            rej(error)
                        }
                    
                    })
                } catch (error) {
                    rej(error)
                }
            })
        }))
    }

    function removeImgsFromDB(packRef: StorageReference) {
        return Promise.all(removedImgUrls.map(url => {
            const imgName = url.split('?')[0].split('packs')[1].split('%2F').slice(-1)[0]
            deleteObject(ref(packRef, imgName))
        }))
    }

    function updateUserPack(pack: ClientPack) {
        if (!$userData || !pack) return;

        const {id, ...packData} = pack

        return updateDoc(doc(db, "users", $userData.dbId), {
            packs: {
                [id]: packData
            }
        })
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
    {#each currImgUrls as imgUrl, i (i)}
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