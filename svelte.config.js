import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

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
    alias: {
      $assets: "./src/assets",
      $search: "./src/search",
    },
    experimental: {
      remoteFunctions: true,
    },
  },
};
