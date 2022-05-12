import type { RequestHandler } from '@sveltejs/kit'

import { articles } from '$lib/articles'

export const get: RequestHandler = async () => {
  return {
    body: {
      articles: await Promise.all(
        [...articles.entries()].map(([path, load]) =>
          load().then(({ metadata }) => ({ path, ...metadata }))
        )
      ).then((articles) =>
        articles.sort(({ date: a }, { date: z }) => {
          return new Date(z ?? 0).getTime() - new Date(a ?? 0).getTime()
        })
      ),
    },
  }
}
