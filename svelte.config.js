import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import("@sveltejs/kit").Config} */
export default {
  extensions: [".svelte", ".md"],

  preprocess: [vitePreprocess()],

  kit: {
    adapter: adapter(),
    alias: {
      $assets: "./src/assets",
      $search: "./src/search",
    },
  },

  compilerOptions: {
    preserveWhitespace: true,
  },
};
