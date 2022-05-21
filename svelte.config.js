import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'
import { highlight } from './src/lib/prism.js'
import rehypeAutolink from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

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
      smartypants: { dashes: 'oldschool' },
      remarkPlugins: [],
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
      highlight: {
        highlighter: (code, lang) =>
          lang
            ? `<pre class="language-${lang}">{@html ${JSON.stringify(
                highlight(code, lang)
              )}}</pre>`
            : `<pre>{@html ${JSON.stringify(code)}}</pre>`,
      },
    }),
  ],

  kit: {
    adapter: adapter(),
    trailingSlash: 'never',
    prerender: {
      default: true,
    },
    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: '@use "src/variables.scss" as *;',
          },
        },
      },
    },
  },
}

export default config
