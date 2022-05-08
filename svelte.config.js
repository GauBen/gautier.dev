import { mdsvex } from 'mdsvex'
import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'

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
