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
import { loadingStore } from "./loading.js";

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

      loadingStore.startLoading("Signing in...");

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      loadingStore.stopLoading();

      console.log(newData.packs);

      if (newData?.packs?.length > 0) {
        newData.packs = await movePacks(newData.packs, oldDisplayName, user.uid);
      }

      //in this case newData.displayNamef = anonymous, that's why it's the second option
      let name = user?.email?.split("@")[0] || newData.displayName;

      updateProfile(user, {
        displayName: name,
      });

      loadingStore.startLoading("Updating user data...");

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

      loadingStore.stopLoading();

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

      loadingStore.startLoading("Signing up...");

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      loadingStore.stopLoading();

      initialData?.packs?.filter(pack => pack.length > 0);

      if (initialData?.packs?.length > 0) {
        initialData.packs = await movePacks(initialData.packs, oldDisplayName, user.uid);
      }

      loadingStore.startLoading("Creating user profile...");

      await setDoc(doc(db, "users", user.uid), initialData);

      loadingStore.stopLoading();

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

async function moveFiles(srcRef, destRef, updateProgress) {
  try {
    const files = await listAll(srcRef);
  
    return Promise.all(files.items.map(async (file) => {
      const newFileRef = ref(storage, `${destRef}/${file.name}`);

      return new Promise(async (resolve, reject) => {
        try {
          const blob = await getBlob(file);
          const snapshot = await uploadBytes(newFileRef, blob);
          const url = await getDownloadURL(snapshot.ref);
          await deleteObject(file);

          updateProgress();
          resolve({
            url,
            path: snapshot.ref.fullPath
          });
        } catch (error) {
          reject(error);
        }
      })
    }))

  } catch (error) {
    throw new Error(error);
  }
}

async function movePacks(packs, oldId, newId) { //oldId = anonymouse<some-id>; newId = user.uid
  
  const imgsCount = packs.reduce((acc, curr) => acc + curr.imgRefPaths.length, 0);
  let uploadedCount = 0;
  
  try {
    loadingStore.startLoading("Moving images...");

    const newPacksData = await Promise.all(packs.map(pack => {
      const srcRef = ref(storage, `packs/${oldId}/${pack?.id}`)
      const destRef = ref(storage, `packs/${newId}/${pack.id}`)
  
      return new Promise(async (resolve, reject) => {
        try {
          const newData = await moveFiles(srcRef, destRef, () => {
            loadingStore.updateProgress(++uploadedCount / imgsCount);
          });

          resolve({
            ...pack,
            imgRefPaths: newData.map(file => file.path),
            imgUrls: newData.map(file => file.url)
          });
        } catch (error) {
          reject(error);
        }
      })
    }))

    loadingStore.stopLoading();

    return newPacksData.reduce((acc, curr) => {
      acc[curr.id] = {
        title: curr.title,
        imgRefPaths: curr.imgRefPaths,
        imgUrls: curr.imgUrls
      };
      return acc;
    }, {});
  } catch (error) {
    console.error(error)
  }

}