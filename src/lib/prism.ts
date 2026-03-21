import { renderMermaidSVG, type RenderOptions } from "beautiful-mermaid";
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

const options: RenderOptions = {
  nodeSpacing: 16,
  padding: 2,
  componentSpacing: 16,
  layerSpacing: 16,
};
const renderMermaid = (code: string) => {
  let title = "";
  if (code.startsWith("%%")) {
    const end = code.indexOf("\n");
    title = code.slice(2, end).trim();
    code = code.slice(end + 1);
  }
  let html = renderMermaidSVG(code, options);
  if (code.startsWith("flowchart LR")) {
    html =
      html
        .replace("<svg", '<svg class="lr"')
        .replaceAll(/id="|url\(#/g, (match) => `${match}lr-`) +
      renderMermaidSVG(code.replace("flowchart LR", "graph TD"), options)
        .replace("<svg", '<svg class="td"')
        .replaceAll(/id="|url\(#/g, (match) => `${match}td-`);
  }
  return `<figure class="mermaid">${html.replaceAll(
    /<style>.*?<\/style>/gs,
    "",
  )}${title && `<figcaption>${title}</figcaption>`}</figure>`;
};

export const highlight = (code: string, lang: string) =>
  lang === "mermaid"
    ? renderMermaid(code)
    : lang
      ? `<pre class="language-${lang}"><code class='language-${lang}'>${Prism.highlight(
          code,
          Prism.languages[lang],
          lang,
        )
          // Shrink JSON serialization with single quotes
          .replaceAll(/class="([^"]*)"/g, "class='$1'")}</code></pre>`
      : `<pre>${code}</pre>`;
