import type { RequestHandler } from '@sveltejs/kit'

import { articles } from '$lib/articles.js'

export const get: RequestHandler = async () => {
  return {
    body: {
      articles: await Promise.all(
        [...articles.entries()].map(([path, load]) =>
          load().then(({ metadata }) => ({ path, ...metadata }))
        )
      ),
    },
  }
}
