<script>
  import Header from "../lib/components/Header.svelte";

   import { onMount } from "svelte";
    import {auth} from "$lib/firebase/firebase.client"
    import {authStore} from "$lib/stores/auth"

    import { userData } from "$lib/stores/userData";

    import { db } from "$lib/firebase/firebase.client";
    import { getDoc, doc, setDoc } from "firebase/firestore";

    import stateMachine from "$lib/stores/state.js";
  import { updateProfile } from "firebase/auth";
  import { usersRef } from "../lib/firebase/firebase.client";

    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            console.log(user);
            
            authStore.update(curr => {
                return {
                    ...curr,
                    isLoading: false,
                    user: user
                }
            })

            if (user === null) {
                userData.set({});
            } else {
                const docRef = doc(db, "users", user.uid);
                getDoc(docRef).then((userDoc) => {
                    if (userDoc.exists()) {
                        console.log(userDoc.data());
                        userData.set(userDoc.data());
                    } else {
                        console.log("No such document!");
                        let displayName = user.email.split("@")[0];

                        updateProfile(user, {
                            displayName: displayName
                        }).then(() => {
                            console.log("Profile updated!");
                        }).catch((error) => {
                            console.log(error);
                        });

                        userData.createNewUser(displayName)

                        setDoc(doc(usersRef, user.uid), $userData).then(() => {
                            console.log("Document successfully written!");
                        }).catch((error) => {
                            console.error("Error writing document: ", error);
                        });
                    }
                });
            }
        })


        return unsubscribe;
    }) 
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
