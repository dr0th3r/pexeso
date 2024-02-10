import type { ClientUser, ClientPack, DBPacks } from '$lib/types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase.client';

import userData from '$lib/stores/userData';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import defaultPacks from '$lib/defaultPacks';

export const signUp = async (initialData: ClientUser | null, email: string, password: string) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
        if (!user) throw new Error('User not created');
    
        const { uid } = user;

        if (!initialData) initialData = userData.createTemplate();

        if (initialData.packs.length > 0) {
            initialData.packs = await movePacks(initialData.packs, uid);
        }

        await setDoc(doc(db, 'users', uid), userData.parseForDB(initialData)[0]);

        userData.set({
            ...initialData,
            dbId: uid,
            packs: [...initialData.packs, ...defaultPacks]
        });
    } catch (error) {
        if (typeof error === 'string') throw new Error(error);
        if (error instanceof Error) throw error;
    }
}

export const signIn = async (newData: ClientUser | null, email: string, password: string) => {
    try {
        const { user} = await signInWithEmailAndPassword(auth, email, password);

        if (!user) throw new Error('No such user');

        const { uid } = user;

        if (!newData) newData = userData.createTemplate();

        if (newData?.packs?.length > 0) {
            newData.packs = await movePacks(newData.packs, uid);
        }

        const userDoc = await getDoc(doc(db, 'users', uid))

        if (!userDoc.exists()) {
            const docData = userData.parseForDB(newData)[0];
            console.log(docData);

            await setDoc(doc(db, 'users', uid), userData.parseForDB(newData)[0]);

            userData.set({
                ...newData,
                dbId: uid
            });
        } else {
            const userDocData = userDoc.data();

            const combinedData = {
                ...userDocData,
                ...newData,
                name: userDocData.name,
                stats: {
                    gamesPlayed: userDocData.stats.gamesPlayed + newData.stats.gamesPlayed,
                    winCount: userDocData.stats.winCount + newData.stats.winCount,
                    leastCardsFlipped: Math.min(userDocData.stats.leastCardsFlipped, newData.stats.leastCardsFlipped),
                    mostCardsFoundInRow: Math.max(userDocData.stats.mostCardsFoundInRow, newData.stats.mostCardsFoundInRow),
                    bestTime: Math.min(userDocData.stats.bestTime, newData.stats.bestTime)
                },
                packs: [
                    ...Object.entries(userDocData.packs as DBPacks).map(([id, pack]) => {
                        return { id, ...pack } as ClientPack;
                    }),
                    ...newData.packs
                ]
            }

            await setDoc(doc(db, 'users', uid), userData.parseForDB(combinedData)[0]);
            
            userData.set({
                ...combinedData,
                dbId: uid,
                packs: [...combinedData.packs, ...defaultPacks]
            });
        }
        
    } catch (error) {
        if (typeof error === 'string') throw new Error(error);
        if (error instanceof Error) throw error;
    }
}

export const logOut = async () => {
    try {
        await signOut(auth);
        userData.reset();
    } catch (error) {
        if (typeof error === 'string') throw new Error(error);
        if (error instanceof Error) throw error;
    }
}


async function movePacks(packs: ClientPack[], uid: string) {
    packs = packs.filter(pack => pack.imgUrls.length > 0 && pack.id.length > 5);

    const newPackImgUrls = await Promise.all(packs.map(pack => {
        return Promise.all(pack.imgUrls.map(url => {
            const downloadUrl = `packs/${url.split('?')[0].split('packs')[1].split('%2F').slice(1).join('/')}`
            const uploadUrl = `packs/${uid}/${pack.id}/${downloadUrl.split('/').slice(-1)}`

            const downloadRef = ref(storage, downloadUrl);
            const uploadRef = ref(storage, `packs/${uid}/${pack.id}/${uploadUrl}`)

            return new Promise<string>(async (res, rej) => {
                try {                    
                    const img = await getBlob(downloadRef);

                    if (!img) rej('Failed to get image');
    
                    const snapshot = await uploadBytes(uploadRef, img)

                    if (!snapshot) rej('Failed to upload image');

                    const newUrl = await getDownloadURL(snapshot.ref);

                    if (!newUrl) rej('Failed to get new url');

                    res(newUrl);
                } catch (error) {
                    rej(error);
                }
        })
        }))
    }))

    return packs.map((pack, i) => ({
        ...pack,
        imgUrls: newPackImgUrls[i]
    }))
}
