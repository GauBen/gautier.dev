import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "adapter-node-sea";

/** @type {import("@sveltejs/kit").Config} */
export default {
  extensions: [".svelte", ".md"],

  preprocess: [vitePreprocess()],

  compilerOptions: {
    experimental: {
      async: true,
    },
  },

  kit: {
    adapter: adapter(),
    alias: {
      $assets: "./src/assets",
      $search: "./src/search",
    },
    experimental: {
      remoteFunctions: true,
    },
  },
};
