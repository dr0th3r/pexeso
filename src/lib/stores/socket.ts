import {writable} from 'svelte/store';

import { Socket } from 'socket.io-client';

export const socketStore = writable<Socket | null>(null);