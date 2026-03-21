import { renderMermaidSVG } from "beautiful-mermaid";
import Prism from "prismjs";

import "prism-svelte";
import "prismjs-gleam";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-diff.js";
import "prismjs/components/prism-erlang.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-scss.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/plugins/diff-highlight/prism-diff-highlight.js";

Prism.manual = true;

for (const lang of Object.keys(Prism.languages))
  Prism.languages[`diff-${lang}`] = Prism.languages.diff;

Prism.languages.pina = Prism.languages.typescript;
Prism.languages.jsonc = Prism.languages.json;

export const highlight = (code: string, lang: string) =>
  lang === "mermaid"
    ? `<figure class="mermaid">${renderMermaidSVG(code, {
        nodeSpacing: 16,
        padding: 2,
        componentSpacing: 16,
        layerSpacing: 16,
      }).replace(
        /<style>.*<\/style>/s,
        "",
      )}${code.startsWith("%%") ? `<figcaption>${code.slice(2).split("\n").shift()}</figcaption>` : ""}</figure>`
    : lang
      ? `<pre class="language-${lang}"><code class='language-${lang}'>${Prism.highlight(
          code,
          Prism.languages[lang],
          lang,
        )
          // Shrink JSON serialization with single quotes
          .replaceAll(/class="([^"]*)"/g, "class='$1'")}</code></pre>`
      : `<pre>${code}</pre>`;
