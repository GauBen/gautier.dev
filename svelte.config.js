import { mdsvex } from "mdsvex";

/** @type {import("@sveltejs/kit").Config} */
export default {
  extensions: [".svelte", ".md"],

  preprocess: [
    mdsvex({
      extension: ".md",
    }),
  ],
};
