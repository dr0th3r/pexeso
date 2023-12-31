import { writable } from "svelte/store";
import { auth, storage } from "../firebase/firebase.client.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { userData } from "./userData.js";
import { db } from "../firebase/firebase.client.js";
import { getDoc, setDoc, doc } from "firebase/firestore";

import stateMachine from "./state.js";
import { listAll, ref, getBlob, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";

export const authStore = writable({
  user: null,
  loading: false,
  error: null,
});

export const authHandlers = {
  signIn: async (email, password, newData, oldDisplayName) => { //oldDisplayName = anonymouse<some-id>
    try {
      authStore.set({
        user: null,
        loading: true,
        error: null,
      });
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      console.log(newData.packs);

      if (newData?.packs?.length > 0) {
        newData.packs = await movePacks(newData.packs, oldDisplayName, user.uid);
      }

      //in this case newData.displayNamef = anonymous, that's why it's the second option
      let name = user?.email?.split("@")[0] || newData.displayName;

      updateProfile(user, {
        displayName: name,
      });

      const docSnap = await getDoc(doc(db, "users", user.uid));

      if (!docSnap?.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          ...newData,
          displayName: name,
        });
        userData.setFromDBData(newData);
      } else if (newData) {
        const docData = docSnap.data();
        let updatedData = {
          displayName: docData.displayName,
          gamesPlayed: docData.gamesPlayed + newData.gamesPlayed,
          leastCardsFlipped: Math.min(
            docData.leastCardsFlipped,
            newData.leastCardsFlipped
          ),
          mostFoundInRow: Math.max(
            docData.mostFoundInRow,
            newData.mostFoundInRow
          ),
          packs: {
            ...docData.packs,
            ...newData.packs,
          }
        };
        await setDoc(doc(db, "users", user.uid), updatedData);


        userData.setFromDBData(updatedData);
      }

      stateMachine.emit({ type: "goToMainMenu" });
    } catch (error) {
      console.error(error);
      authStore.set({
        user: null,
        loading: false,
        error: error.message,
      });
    }
  },
  signUp: async (email, password, initialData, oldDisplayName) => { //oldDisplayName = anonymouse<some-id>
    console.log(initialData);

    try {
      authStore.set({
        user: null,
        loading: true,
        error: null,
      });

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      initialData?.packs?.filter(pack => pack.length > 0);

      if (initialData?.packs?.length > 0) {
        initialData.packs = await movePacks(initialData.packs, oldDisplayName, user.uid);
      }

      await setDoc(doc(db, "users", user.uid), initialData);

      console.log(initialData);

      userData.setFromDBData(initialData);

      updateProfile(user, {
        displayName: initialData?.displayName,
      });

      stateMachine.emit({ type: "goToMainMenu" });
    } catch (error) {
      console.error(error);
      authStore.set({
        user: null,
        loading: false,
        error: error.message,
      });
    }
  },
  logOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      authStore.set({
        user: null,
        loading: false,
        error: error.message,
      });
    }
  },
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      authStore.set({
        user: null,
        loading: false,
        error: error.message,
      });
    }
  },
  updateEmail: async (email) => {
    try {
      await updateEmail(auth, email);
    } catch (error) {
      authStore.set({
        user: null,
        loading: false,
        error: error.message,
      });
    }
  },
  updatePassword: async (password) => {
    try {
      await updatePassword(auth, password);
    } catch (error) {
      authStore.set({
        user: null,
        loading: false,
        error: error.message,
      });
    }
  },
};

async function moveFiles(sourceRef, destRef) {
  // Download all files from oldRef
  const newFileUrls = [];
  const newFileRefPaths = [];

  const promises = [];

  const files = await listAll(ref(storage, sourceRef));
  for (const file of files.items) {
    // Copy each file to the new location
    const newFileRef = ref(storage, `${destRef}/${file.name}`);
    promises.push(
      getBlob(file).then(blob => {
        return uploadBytes(newFileRef, blob).then((snapshot) => {
          return getDownloadURL(snapshot.ref).then((url) => {
            newFileUrls.push(url);
            newFileRefPaths.push(snapshot.ref.fullPath);
            return deleteObject(file).then(() => {
              console.log('File moved')
            }).catch(err => console.error(err));
          }).catch(err => console.error(err));
        }).catch(err => console.error(err));
      })
    )
  }

  try {
    await Promise.all(promises);
    console.log(newFileUrls);

    return {
      urls: newFileUrls,
      paths: newFileRefPaths
    };
  } catch (error) {
    console.error(error);
    return []
  }
}

async function movePacks(packs, oldId, newId) { //oldId = anonymouse<some-id>; newId = user.uid
  const promises = [];

  for (const pack of packs) {
    const sourceRef = ref(storage, `packs/${oldId}/${pack?.id}`)
    const destRef = ref(storage, `packs/${newId}/${pack.id}`)

    promises.push(moveFiles(sourceRef, destRef)); 
  }

  try {
    const newPacksData = await Promise.all(promises);

    return newPacksData.reduce((acc, curr, i) => {
      const pack = packs[i];
      acc[pack.id] = {
        title: pack.title,
        imgRefPaths: curr.paths,
        imgUrls: curr.urls
      };
      return acc;
    }, {});
  } catch (error) {
    console.error(error);
  }
}