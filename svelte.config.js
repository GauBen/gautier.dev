import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
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
      layout: "./src/lib/markdown/Layout.svelte",
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
          }),
        ],
      ],
      smartypants: { dashes: "oldschool" },
    }),
  ],

  kit: {
    adapter: adapter(),
    alias: {
      $assets: "./src/assets",
      $search: "./src/search",
    },
  },
};
