import Prism from 'prismjs'
export { Prism }

import 'prism-svelte'
import 'prismjs/components/prism-diff.js'
import 'prismjs/components/prism-ocaml.js'
import 'prismjs/components/prism-ruby.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/plugins/diff-highlight/prism-diff-highlight.js'

Prism.manual = true

for (const lang of Object.keys(Prism.languages))
  Prism.languages[`diff-${lang}`] = Prism.languages.diff

export const highlight = (
  /** @type {string} */ code,
  /** @type {string} */ lang
) =>
  `<code class="language-${lang}">${Prism.highlight(
    code,
    Prism.languages[lang],
    lang
  )}</code>`
