import { writable } from "svelte/store";

import type { ClientUser, DBUser } from "../types";

import { updateDoc, doc } from "firebase/firestore";

import { db } from "../firebase/firebase.client";
import defaultPacks from "$lib/defaultPacks";

function createUserTemplate(name=`Anonymous_${Math.floor(Math.random() * 1000)}`): ClientUser {
    return {
        dbId: "",
        socketId: "",
        name: name,
        stats: {
            gamesPlayed: 0,
            winCount: 0,
            leastCardsFlipped: Infinity,
            mostCardsFoundInRow: 0,
            bestTime: Infinity
        },
        selectedPackId: "0",
        packs: defaultPacks,
    }
}

const userData = function() {
    const { subscribe, set, update } = writable<ClientUser | null>(null);

    return {
        subscribe,
        set,
        update,
        reset: () => set(createUserTemplate()),
        createTemplate: createUserTemplate,
        setFromDB: (dbUser: DBUser, dbId: string) => {
            set({
                ...dbUser,
                dbId,
                socketId: "", //add creating one later
                packs: [...Object.entries(dbUser.packs).map(([id, pack]) => {
                    return { id, ...pack }
                }), ...defaultPacks]
            })
        },
        parseForDB: (user: ClientUser) => {
            const { dbId, socketId, ...DBUser } = user; //we get rid of the ids
            
            return [
                {
                ...DBUser,
                packs: user.packs.reduce((acc, pack) => {
                    acc[pack.id] = pack;
                    return acc;
                }, {} as DBUser["packs"])
                } as DBUser,
                user.dbId
            ] as [DBUser, string];
        },
        updateStats: async (stats: Partial<ClientUser["stats"]>) => {
            let dbId = null;

            let oldStats = {};
            let updatedStats = {};

            update((user) => {
                if (!user) return null;

                dbId = user.dbId;

                oldStats = user.stats;

                updatedStats = {
                    ...oldStats,
                    ...stats
                }

                return {
                    ...user,
                    stats: updatedStats
                } as ClientUser;
            })

            if (dbId) {
                try {
                    await updateDoc(doc(db, "users", dbId), {
                        stats: updatedStats
                    })
                } catch (error) {
                    console.error(error);
                    update((user) => ({
                        ...user,
                        stats: oldStats
                    }) as ClientUser)
                }
            }
        }
    }
}();

export default userData;