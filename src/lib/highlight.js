import hljs from 'highlight.js'
// @ts-expect-error This lib is not typed
import svelte from 'highlightjs-svelte'
svelte(hljs)

export const highlight = (
  /** @type {string} */ code,
  /** @type {string} */ language
) => hljs.highlight(code, { language }).value

export const highlighter = (
  /** @type {string} */ code,
  /** @type {string} */ language
) => {
  const highlighted = highlight(code, language)
    .replace(
      /[{}`]/g,
      // @ts-expect-error No undefined here
      (c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' }[c])
    )
    .replace(/\\([trn])/g, '&#92;$1')
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
