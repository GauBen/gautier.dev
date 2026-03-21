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
      markdownItOptions: { highlight },
      use: (md) =>
        md
          // @ts-expect-error markdown-it/markdown-exit type incompatibility
          .use(tex, {
            render: (content, displayMode) => {
              const html = `{@html ${JSON.stringify(katex.renderToString(content, { displayMode }))}}`;
              return displayMode ? `<p class="math">${html}</p>` : html;
            },
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
          .use(tasklist, { label: false })
          .use((md) => {
            const originalFence = md.renderer.rules.fence!;
            md.renderer.rules.fence = async (tokens, idx, ...options) => {
              if (tokens[idx].info.trim() === "mermaid")
                return highlight(tokens[idx].content, "mermaid");
              return originalFence(tokens, idx, ...options);
            };
          }),
    }),
    enhancedImages(),
    sveltekit(),
  ],
});
