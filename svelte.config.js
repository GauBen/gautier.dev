import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import { resolve } from "node:path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatexSvelte from "rehype-katex-svelte";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import { highlight } from "./src/lib/prism.js";

/** @type {import("@sveltejs/kit").Config} */
export default {
  extensions: [".svelte", ".md"],

  preprocess: [
    vitePreprocess(),
    mdsvex({
      extension: ".md",
      layout: resolve("./src/lib/markdown/Layout.svelte"),
      highlight: {
        highlighter: (code, lang) => {
          if (!lang) return `<pre>{@html ${JSON.stringify(code)}}</pre>`;
          return `<pre class="language-${lang}">{@html ${JSON.stringify(
            highlight(code, lang),
          )}}</pre>`;
        },
      },
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatexSvelte,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          /** @type {import("rehype-autolink-headings").Options} */ ({
            content: { type: "text", value: "#" },
            properties: { title: "Link to this heading" },
          }),
        ],
      ],
      smartypants: { dashes: "oldschool" },
    }),
  ],

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
