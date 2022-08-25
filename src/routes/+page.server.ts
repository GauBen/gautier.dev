import { articles } from '$lib/articles'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({
  articles: await Promise.all(
    [...articles.entries()].map(async ([path, load]) =>
      load().then(({ metadata }) => ({ path, ...metadata }))
    )
  ).then((articles) =>
    articles.sort(
      ({ date: a }, { date: z }) =>
        new Date(z ?? 0).getTime() - new Date(a ?? 0).getTime()
    )
  ),
})
