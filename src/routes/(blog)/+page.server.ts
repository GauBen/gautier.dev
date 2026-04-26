import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { articles } from "$lib/articles.js";

export const _fetchInteractions = async () => {
  const response = await fetch("https://api.github.com/graphql", {
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
                reactions {
                  totalCount
                }
                comments(first: 100) {
                  nodes {
                    replies {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      `,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }
  const { data } = await response.json();
  return new Map(
    (
      data.repository.discussions.nodes as Array<{
        title: string;
        reactions: { totalCount: number };
        comments: { nodes: Array<{ replies: { totalCount: number } }> };
      }>
    ).map(({ title, comments, reactions }) => [
      title,
      {
        comments: comments.nodes.reduce(
          (total, { replies }) => total + replies.totalCount,
          comments.nodes.length, // Count top-level comments as well
        ),
        reactions: reactions.totalCount,
      },
    ]),
  );
};

export const load = async () => ({
  title: "Hey!",
  description:
    "Fullstack web engineer, security specialist & design enthusiast.",
  articles: await Promise.all(
    [...articles.entries()].map(async ([slug, { date, load }]) =>
      load().then(({ frontmatter, banner }) => ({
        ...frontmatter,
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
  prerenderedInterations: env.GITHUB_TOKEN
    ? await _fetchInteractions()
    : (console.warn("GITHUB_TOKEN not set, fetching interactions skipped"),
      new Map<string, { comments: number; reactions: number }>()),
});
