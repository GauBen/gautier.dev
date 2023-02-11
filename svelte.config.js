import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'
import rehypeAutolink from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import preprocess from 'svelte-preprocess'
import { highlight } from './src/lib/prism.js'
import { escape } from 'svelte/internal'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      scss: {
        prependData: '@use "src/variables.scss" as *;',
      },
    }),
    mdsvex({
      extensions: ['.md'],
      layout: './src/lib/markdown/layout.svelte',
      highlight: {
        highlighter: (code, lang) => {
          if (lang === 'mermaid')
            return `<div class="mermaid">${escape(code)}</div>`
          if (!lang) return `<pre>{@html ${JSON.stringify(code)}}</pre>`
          return `<pre class="language-${lang}">{@html ${JSON.stringify(
            highlight(code, lang)
          )}}</pre>`
        },
      },
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolink,
          /** @type {import('rehype-autolink-headings').Options} */ ({
            content: { type: 'text', value: '#' },
            properties: {},
          }),
        ],
      ],
      smartypants: { dashes: 'oldschool' },
    }),
  ],

  kit: {
    adapter: adapter(),
  },
}

export default config
