import { dev } from "$app/environment";
import { articles } from "$lib/articles.js";

export const load = async () => ({
  title: "Hey!",
  description:
    "Fullstack web engineer, security specialist & design enthusiast.",
  articles: await Promise.all(
    [...articles.entries()].map(async ([slug, { date, load }]) =>
      load().then(({ metadata, banner }) => ({
        ...metadata,
        slug,
        date,
        banner,
      })),
    ),
  ).then((articles) =>
    articles
      .filter(({ date }) => dev || date)
      .sort(({ date: a }, { date: z }) =>
        a === null ? -1 : z === null ? 1 : z.getTime() - a.getTime(),
      ),
  ),
});
