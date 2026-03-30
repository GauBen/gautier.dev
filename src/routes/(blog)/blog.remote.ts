import { prerender, query } from "$app/server";
import { env } from "$env/dynamic/private";
import { articles } from "$lib/articles.js";

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
process.env.IS_ADAPTER_BUILD || import("$lib/prism.js");

export const getSnippet = prerender("unchecked", async (slug: string) => {
  if (process.env.IS_ADAPTER_BUILD) throw new Error("not available at runtime");
  const { highlight } = await import("$lib/prism.js");
  const article = await articles.get(slug)?.load();
  if (!article || !article.frontmatter.snippet) return "";
  const { code, lang } = article.frontmatter.snippet;
  return highlight(code, lang);
});

const fetchInteractions = async () => {
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

export const getPrerenderedInteractions = prerender(fetchInteractions);

let interactionsCache:
  | Map<string, { comments: number; reactions: number }>
  | undefined;
let interactionsCacheTimestamp = 0;
export const getFreshInteractions = query(async () => {
  if (interactionsCacheTimestamp > Date.now() - 60_000)
    return interactionsCache;

  try {
    interactionsCache = await fetchInteractions();
    return interactionsCache || getPrerenderedInteractions();
  } catch {
    return undefined;
  } finally {
    interactionsCacheTimestamp = Date.now();
  }
});
