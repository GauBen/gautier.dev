import { dev } from "$app/environment";
import { articles } from "$lib/articles";

export const load = () => ({
  articles: Promise.all(
    [...articles.entries()].map(async ([slug, { date, load }]) =>
      load().then(({ metadata, banner }) => ({
        ...metadata,
        date,
        slug,
        banner,
      })),
    ),
  ).then((articles) =>
    articles
      .filter(({ draft }) => dev || !draft)
      .sort(({ date: a }, { date: z }) => z.getTime() - a.getTime()),
  ),
});
