import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import mdKatex, { type MarkdownKatexOptions } from "@vscode/markdown-it-katex";
import katex from "katex";
import mdAnchor from "markdown-it-anchor";
import unocss from "unocss/vite";
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
          // @ts-expect-error average cjs package
          mdKatex.default,
          {
            katex: {
              ...katex,
              renderToString: (tex, options) =>
                `{@html ${JSON.stringify(katex.renderToString(tex, options))}}`,
            },
          } satisfies MarkdownKatexOptions,
        ],
        [
          mdAnchor,
          {
            tabIndex: false,
            permalink: mdAnchor.permalink.linkInsideHeader({
              symbol: "#",
              placement: "before",
              class: "",
            }),
          } satisfies mdAnchor.AnchorOptions,
        ],
      ],
    }),
    enhancedImages(),
    sveltekit(),
    unocss(),
  ],
});
