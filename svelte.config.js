import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'
import { highlighter } from './src/lib/highlight.js'

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
      smartypants: {
        dashes: 'oldschool',
      },
      remarkPlugins: [],
      rehypePlugins: [],
      highlight: {
        highlighter: (code, lang) =>
          `<pre class="language-${lang}">{@html ${JSON.stringify(
            highlighter(code, lang)
          )}}</pre>`,
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
