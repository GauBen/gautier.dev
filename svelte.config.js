import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'
import rehypeAutolink from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import preprocess from 'svelte-preprocess'
import { highlight } from './src/lib/prism.js'

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
        highlighter: (code, lang) =>
          lang
            ? `<pre class="language-${lang}">{@html ${JSON.stringify(
                highlight(code, lang)
              )}}</pre>`
            : `<pre>{@html ${JSON.stringify(code)}}</pre>`,
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
    trailingSlash: 'never',
    prerender: {
      default: true,
    },
  },
}

export default config
