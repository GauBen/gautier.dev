import { dev } from "$app/environment";
import { articles } from "$lib/articles";

export const load = () => ({
  articles: Promise.all(
    [...articles.entries()].map(async ([path, load]) =>
      load().then(({ metadata }) => ({ path, ...metadata })),
    ),
  ).then((articles) =>
    articles
      .filter(({ draft }) => dev || !draft)
      .sort(
        ({ date: a }, { date: z }) =>
          new Date(z ?? 0).getTime() - new Date(a ?? 0).getTime(),
      ),
  ),
});
