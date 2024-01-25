import { writable } from "svelte/store";

import type { GameStats } from "../types";

export default writable<{
    [key: string]: GameStats
}>({})