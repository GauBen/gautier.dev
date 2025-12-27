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

/**
 * @param {string} code
 * @param {string} lang
 */
export const highlight = (code, lang) =>
  `<code class='language-${lang}'>${Prism.highlight(
    code,
    Prism.languages[lang],
    lang,
  )
    // Shrink JSON serialization with single quotes
    .replaceAll(/class="([^"]*)"/g, "class='$1'")}</code>`;
