import { tasklist } from "@mdit/plugin-tasklist";
import { tex, type MarkdownItTexOptions } from "@mdit/plugin-tex";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import katex from "katex";
import mdAnchor from "markdown-it-anchor";
import { defineConfig } from "vite";
import svelteMd from "vite-plugin-svelte-md";
import { highlight } from "./src/lib/prism.js";

export default defineConfig({
  plugins: [
    svelteMd({
      headEnabled: false,
      wrapperClasses: "markdown-content",
      markdownItOptions: {
        highlight: (code, lang) => {
          if (!lang) return `<pre>${code}</pre>`;
          return `<pre class="language-${lang}">${highlight(code, lang)}</pre>`;
        },
      },
      markdownItUses: [
        [
          tex,
          {
            render: (content, displayMode) =>
              `{@html ${JSON.stringify(katex.renderToString(content, { displayMode }))}}`,
          } satisfies MarkdownItTexOptions,
        ],
        [
          mdAnchor,
          {
            tabIndex: false,
            permalink: mdAnchor.permalink.linkInsideHeader({
              symbol: "#",
              placement: "before",
              class: "",
              space: false,
            }),
          } satisfies mdAnchor.AnchorOptions,
        ],
        [tasklist, { label: false }],
      ],
    }),
    enhancedImages(),
    sveltekit(),
  ],
});
