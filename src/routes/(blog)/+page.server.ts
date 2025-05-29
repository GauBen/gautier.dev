import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
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
  commentCounts: fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Token ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: /* GraphQL */ `
        {
          repository(owner: "gauben", name: "gautier.dev") {
            discussions(categoryId: "DIC_kwDOHTUX9M4CXmQB", first: 100) {
              nodes {
                title
                comments {
                  totalCount
                }
              }
            }
          }
        }
      `,
    }),
  })
    .then((response) =>
      response.json().then((x) => (response.ok ? x : Promise.reject(x))),
    )
    .then(
      ({ data }) =>
        new Map(
          (
            data.repository.discussions.nodes as Array<{
              title: string;
              comments: { totalCount: number };
            }>
          ).map(({ title, comments }) => [title, comments.totalCount]),
        ),
      (error) => {
        console.log(error);
        return undefined;
      },
    ),
});
