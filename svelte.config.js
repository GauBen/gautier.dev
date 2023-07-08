import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/kit/vite'
import { mdsvex } from 'mdsvex'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import { highlight } from './src/lib/prism.js'

/** @type {import('@sveltejs/kit').Config} */
export default {
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
          rehypeAutolinkHeadings,
          /** @type {import('rehype-autolink-headings').Options} */ ({
            content: { type: 'text', value: '#' },
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
