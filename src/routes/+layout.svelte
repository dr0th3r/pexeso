<script>
  import Header from "../lib/components/Header.svelte";

  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/firebase.client";
  import { authStore } from "$lib/stores/auth";

  import { userData, createUserTemplate } from "$lib/stores/userData";
  import defaultPacks from "../lib/defaultPacks";

  import { db } from "$lib/firebase/firebase.client";
  import { getDoc, doc, setDoc } from "firebase/firestore";

  import stateMachine from "$lib/stores/state.js";
  import { updateProfile } from "firebase/auth";
  import { usersRef } from "../lib/firebase/firebase.client";

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(user);

      authStore.update((curr) => {
        return {
          ...curr,
          isLoading: false,
          user: user,
        };
      });

      if (user === null) {
        userData.createNewUser("anonymous");
      } else {
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef).then((userDoc) => {
          if (userDoc.exists()) {
            const userPacks = Object.entries(userDoc.data().packs).map(
              ([key, value]) => {
                return {
                  id: key,
                  title: value.title,
                  imgUrls: value.imgUrls,
                };
              }
            );

            userData.update((curr) => ({
              ...curr,
              displayName: userDoc.data().displayName,
              gamesPlayed: userDoc.data().gamesPlayed,
              leastCardsFlipped: userDoc.data().leastCardsFlipped,
              mostFoundInRow: userDoc.data().mostFoundInRow,
              packs: defaultPacks.concat(userPacks),
              modifiedPack: null,
            }));

            $userData.chosenPack =
              $userData.packs.find(
                (pack) => pack.id === userDoc.data().chosenPackId
              ) || $userData.packs[0];
          } else {
            console.log("No such document!");
            let displayName = user.email.split("@")[0];

            updateProfile(user, {
              displayName: displayName,
            })
              .then(() => {
                console.log("Profile updated!");
              })
              .catch((error) => {
                console.log(error);
              });

            userData.createNewUser(displayName);

            let filteredPacks = $userData.packs.filter((pack) =>
              defaultPacks.some((defaultPack) => defaultPack.id !== pack.id)
            );
            let firebasePacks = filteredPacks.reduce((acc, cur) => {
              acc[cur.id] = {
                title: cur.title,
                imgUrls: cur.imgUrls,
              };
              return acc;
            }, {});

            let firebaseUser = {
              displayName: displayName,
              gamesPlayed: $userData.gamesPlayed,
              leastCardsFlipped: $userData.leastCardsFlipped,
              mostFoundInRow: $userData.mostFoundInRow,
              chosenPackId: $userData.chosenPack?.id,
              packs: firebasePacks,
            };

            setDoc(doc(usersRef, user.uid), firebaseUser)
              .then(() => {
                console.log("Document successfully written!");
              })
              .catch((error) => {
                console.error("Error writing document: ", error);
              });
          }
        });
      }
    });

    return unsubscribe;
  });

</script>

<Header />
<div class="slot-container">
  <slot />
</div>

<style>
  .slot-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
