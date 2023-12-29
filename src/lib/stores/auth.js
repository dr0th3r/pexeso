import { writable } from "svelte/store";
import { auth } from "../firebase/firebase.client.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
} from "firebase/auth";

export const authStore = writable({
    user: null,
    loading: false,
    error: null,
})

export const authHandlers = {
    signIn: async (email, password) => {
        try {
            authStore.set({
                user: null,
                loading: true,
                error: null
            });
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            authStore.set({
                user: null,
                loading: false,
                error: error.message
            })
        }
    },
    signUp: async (email, password) => {
        try {
            authStore.set({
                user: null,
                loading: true,
                error: null
            });

            return await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            authStore.set({
                user: null,
                loading: false,
                error: error.message
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
                error: error.message
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
                error: error.message
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
                error: error.message
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
                error: error.message
            });
        }
    },
}