import { tasklist } from "@mdit/plugin-tasklist";
import { tex } from "@mdit/plugin-tex";
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
      use: (md) =>
        md
          // @ts-expect-error markdown-it/markdown-exit type incompatibility
          .use(tex, {
            render: (content, displayMode) =>
              `{@html ${JSON.stringify(katex.renderToString(content, { displayMode }))}}`,
          })
          // @ts-expect-error markdown-it/markdown-exit type incompatibility
          .use(mdAnchor, {
            tabIndex: false,
            permalink: mdAnchor.permalink.linkInsideHeader({
              symbol: "#",
              placement: "before",
              class: "",
              space: false,
            }),
          })
          // @ts-expect-error markdown-it/markdown-exit type incompatibility
          .use(tasklist, { label: false }),
    }),
    enhancedImages(),
    sveltekit(),
  ],
});
