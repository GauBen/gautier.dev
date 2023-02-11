import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import rehypeAutolink from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import { vitePreprocess } from '@sveltejs/kit/vite'
import { highlight } from './src/lib/prism.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],

  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      layout: './src/lib/markdown/layout.svelte',
      highlight: {
        highlighter: (code, lang) => {
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
