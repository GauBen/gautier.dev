import { tex } from "@mdit/plugin-tex";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "adapter-node-sea";
import katex from "katex";
import mdAnchor from "markdown-it-anchor";
import { defineConfig } from "vite";
import svelteMd from "vite-plugin-svelte-md";
import { highlight } from "./src/lib/prism.js";

export default defineConfig({
  plugins: [
    svelteMd({
      headEnabled: false,
      wrapperComponent: "#lib/markdown/Wrapper.svelte",
      use: (md) =>
        md
          // @ts-expect-error markdown-it/markdown-exit type incompatibility
          .use(tex, {
            render: (content, displayMode) => {
              const html = `{@html ${JSON.stringify(katex.renderToString(content, { displayMode }))}}`;
              return displayMode ? `<p class="math">${html}</p>` : html;
            },
          })
          .use(mdAnchor, {
            tabIndex: false,
            permalink: mdAnchor.permalink.linkInsideHeader({
              symbol: "#",
              placement: "before",
              class: "",
              space: false,
            }),
          })
          .use((md) => {
            md.renderer.rules.fence = (tokens, idx) =>
              `{@html ${JSON.stringify(highlight(tokens[idx].content, tokens[idx].info.trim()))}}`;

            md.core.ruler.after("inline", "task-list", ({ Token, tokens }) => {
              for (let i = 2; i < tokens.length; i++) {
                // Ensure we're in a list item
                if (
                  tokens[i - 2].type !== "list_item_open" ||
                  tokens[i - 1].type !== "paragraph_open" ||
                  tokens[i].type !== "inline"
                )
                  continue;

                // List item starts with raw text
                const { children } = tokens[i];
                if (!children?.length || children[0].type !== "text") continue;

                const { content } = children[0];
                if (!/^\[[ xX]\] /.test(content)) continue;
                children[0].content = content.slice(3);

                const open = new Token("html_inline", "", 0);
                open.content = `<label><input type="checkbox" disabled${content.startsWith("[ ]") ? "" : " checked"}>`;
                children.unshift(open);

                const close = new Token("html_inline", "", 0);
                close.content = "</label>";
                children.push(close);
              }
            });
          }),
    }),
    enhancedImages(),
    sveltekit({
      extensions: [".svelte", ".md"],

      preprocess: [vitePreprocess()],

      compilerOptions: {
        experimental: {
          async: true,
        },
      },

      adapter: adapter({ precompress: false }),

      experimental: {
        remoteFunctions: true,
      },
    }),
  ],
});
