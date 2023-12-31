import { deleteApp,  getApp, getApps, initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore, collection, getDocs} from 'firebase/firestore';
import {getStorage, ref} from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
    measurementId: import.meta.env.VITE_MEASUREMENTID
};

let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else { //if there already are any instances, destroy them and initialize again
    firebaseApp = getApp();
    deleteApp(firebaseApp);
    firebaseApp = initializeApp(firebaseConfig);
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const usersRef = collection(db, "users");

export const storage = getStorage(firebaseApp);