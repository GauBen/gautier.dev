import { render as renderMermaidSVG } from "pele";
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
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/plugins/diff-highlight/prism-diff-highlight.js";

Prism.languages.caddyfile = {
  comment: /#.*/,
  matcher: { pattern: /@[\w-]+/, alias: "variable" },
  keyword: /\b(?:https_port|layer4|route|proxy|tls|sni)\b/,
  address: { pattern: /(?:[\w.-]+)?:\d+/, alias: "string" },
  number: /\b\d+\b/,
  punctuation: /[{}]/,
};

Prism.manual = true;

for (const lang of Object.keys(Prism.languages))
  Prism.languages[`diff-${lang}`] = Prism.languages.diff;

Prism.languages.pina = Prism.languages.typescript;
Prism.languages.jsonc = Prism.languages.json;

// Pele's root styles live in markdown-content.css (`.mermaid > svg`); fail the
// build if pele starts emitting variables the stylesheet doesn't declare
const KNOWN_VARS = new Set("bg fg m l s a b c r tw hw w fm".split(" "));

const stripRootStyle = (svg: string) =>
  svg.replace(/\sstyle="([^"]*)"/, (_, style: string) => {
    const unknown = [...style.matchAll(/--([\w-]+):/g)]
      .map(([, name]) => name)
      .filter((name) => !(name[0] === "_" && KNOWN_VARS.has(name.slice(1))));
    if (unknown.length > 0)
      throw new Error(`New ${unknown.join(", ")}: update markdown-content.css`);
    return "";
  });

let diagrams = 0;
const renderMermaid = (code: string) => {
  let title = "";
  if (code.startsWith("%%")) {
    const end = code.indexOf("\n");
    title = code.slice(2, end).trim();
    code = code.slice(end + 1);
  }
  const id = `mermaid-${diagrams++}`;
  // Pele picks the most compact layout (e.g. flips LR to TD) to fit `maxWidth`
  const render = (maxWidth: number) => {
    const { svg, width } = renderMermaidSVG(code, { maxWidth });
    return {
      // Drop node and edge ids, only useful for scripting
      svg: stripRootStyle(svg).replaceAll(/\sdata-id="[^"]*"/g, ""),
      width,
    };
  };
  const wide = render(800);
  const narrow = render(360);
  // Show the narrow layout once the wide one would have to shrink
  const html =
    wide.svg === narrow.svg
      ? wide.svg
      : `<style>@container(width<${Math.ceil(wide.width)}px){#${id}>[data-wide]{display:none}#${id}>[data-narrow]{display:block}}</style>` +
        wide.svg.replace("<svg", "<svg data-wide") +
        narrow.svg.replace("<svg", "<svg data-narrow");
  return `<figure class="mermaid" id="${id}">${html}${title && `<figcaption>${title}</figcaption>`}</figure>`;
};

export const highlight = (code: string, lang: string) =>
  lang === "mermaid"
    ? renderMermaid(code)
    : lang
      ? `<pre class='language-${lang}'><code class='language-${lang}'>${Prism.highlight(
          code,
          Prism.languages[lang],
          lang,
        )
          // Shrink JSON serialization with single quotes
          .replaceAll(/class="([^"]*)"/g, "class='$1'")}</code></pre>`
      : `<pre>${code.replaceAll(/</g, "&lt;")}</pre>`;

export const tokenize = (code: string, lang: string) =>
  Prism.tokenize(code, Prism.languages[lang]);
