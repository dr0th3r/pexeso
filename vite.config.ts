import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import websocketServer from "./websocket-server/index";


export default defineConfig({
  plugins: [sveltekit(), websocketServer],
});
