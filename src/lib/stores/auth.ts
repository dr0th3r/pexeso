import { writable } from "svelte/store";
import { auth, storage } from "../firebase/firebase.client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { userData } from "./userData";
import { db } from "../firebase/firebase.client";
import { getDoc, setDoc, doc } from "firebase/firestore";

import stateMachine from "./state";
import { listAll, ref, getBlob, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { loadingStore } from "./loading";

import type { StorageReference } from "firebase/storage";

export const authStore = writable<{
  user: any;
  loading: boolean;
  error: string | null;
}>({
  user: null,
  loading: false,
  error: null,
});

import type { NewFile, Pack, DBPacks, SignData} from "../types";

export const authHandlers = {
  signIn: async (email: string, password: string, newData: SignData, oldDisplayName: string) => { //oldDisplayName = anonymouse<some-id>
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

      let newPacks: DBPacks | {} = {}

      if (newData?.packs?.length > 0) {
        newPacks = await movePacks(newData.packs, oldDisplayName, user.uid);
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
          packs: newPacks,
        });

        userData.setFromDBData({
          ...newData, 
          displayName: name, 
          packs: newPacks}
        );
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
          chosenPackId: newData.chosenPackId,
          packs: {
            ...docData.packs,
            ...newPacks,
          }
        };
        await setDoc(doc(db, "users", user.uid), updatedData);

        userData.setFromDBData(updatedData)
      }

      loadingStore.stopLoading();

      stateMachine.emit({ type: "goToMainMenu" });
    } catch (error) {
      console.error(error);
      if (typeof error === "string") {
        authStore.set({
          user: null,
          loading: false,
          error: error,
        });
      } else if (error instanceof Error) {
        authStore.set({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },
  signUp: async (email: string, password: string, initialData: SignData, oldDisplayName: string) => { //oldDisplayName = anonymouse<some-id>
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

      initialData?.packs?.filter(pack => pack.imgUrls.length > 0);

      let newPacks: DBPacks | {} = {}

      if (initialData?.packs?.length > 0) {
        newPacks = await movePacks(initialData.packs, oldDisplayName, user.uid);
      }

      loadingStore.startLoading("Creating user profile...");

      await setDoc(doc(db, "users", user.uid), {
        ...initialData,
        packs: newPacks,
      });

      loadingStore.stopLoading();

      console.log(initialData);

      userData.setFromDBData({
        ...initialData, 
        packs: newPacks
      });

      updateProfile(user, {
        displayName: initialData?.displayName,
      });

      stateMachine.emit({ type: "goToMainMenu" });
    } catch (error) {
      console.error(error);
      if (typeof error === "string") {
        authStore.set({
          user: null,
          loading: false,
          error: error,
        });
      } else if (error instanceof Error) {
        authStore.set({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },
  logOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      if (typeof error === "string") {
        authStore.set({
          user: null,
          loading: false,
          error: error,
        });
      } else if (error instanceof Error) {
        authStore.set({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (typeof error === "string") {
        authStore.set({
          user: null,
          loading: false,
          error: error,
        });
      } else if (error instanceof Error) {
        authStore.set({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },
  updateEmail: async (email: string) => {
    try {
      if (!!auth.currentUser) 
        await updateEmail(auth.currentUser, email);
      else
        throw new Error("User not logged in");
    } catch (error) {
      if (typeof error === "string") {
        authStore.set({
          user: null,
          loading: false,
          error: error,
        });
      } else if (error instanceof Error) {
        authStore.set({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },
  updatePassword: async (password: string) => {
    try {
      if (!!auth.currentUser)
        await updatePassword(auth.currentUser, password);
    } catch (error) {
      if (typeof error === "string") {
        authStore.set({
          user: null,
          loading: false,
          error: error,
        });
      } else if (error instanceof Error) {
        authStore.set({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    }
  },
};

async function moveFiles(srcRef: StorageReference, destRef: StorageReference, updateProgress: () => void): Promise<NewFile[]> {
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
    console.error(error);
    return []
  }
}

async function movePacks(packs: Pack[], oldId: string, newId: string): Promise<DBPacks> { //oldId = anonymouse<some-id>; newId = user.uid
  
  const imgsCount = packs.reduce((acc, curr) => {
      if (!curr?.imgRefPaths) return acc;

      return acc + curr.imgRefPaths.length
    }, 0
  );
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
    })) as Pack[];

    if (newPacksData.length !== imgsCount) throw new Error("Something went wrong");

    loadingStore.stopLoading();

    return newPacksData.reduce((acc: DBPacks, curr: Pack) => {
      if (!curr?.imgRefPaths) return acc;
      
      acc[curr.id] = {
        title: curr.title,
        imgRefPaths: curr.imgRefPaths,
        imgUrls: curr.imgUrls,
        chosenSize: curr.imgUrls.length * 2
      };
      return acc;
    }, {});
  } catch (error) {
    console.error(error);
    return {}
  }
}