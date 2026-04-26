import { prerender, query } from "$app/server";
import { articles } from "$lib/articles.js";
import { _fetchInteractions } from "./+page.server.js";

process.env.IS_ADAPTER_BUILD || import("$lib/prism.js");

export const getSnippet = prerender("unchecked", async (slug: string) => {
  if (process.env.IS_ADAPTER_BUILD) throw new Error("not available at runtime");
  const { highlight } = await import("$lib/prism.js");
  const article = await articles.get(slug)?.load();
  if (!article || !article.frontmatter.snippet) return "";
  const { code, lang } = article.frontmatter.snippet;
  return highlight(code, lang);
});

let interactionsCache:
  | Map<string, { comments: number; reactions: number }>
  | undefined;
let interactionsCacheTimestamp = 0;
export const getFreshInteractions = query(async () => {
  if (interactionsCacheTimestamp > Date.now() - 60_000)
    return interactionsCache;

  try {
    interactionsCache = await _fetchInteractions();
    return interactionsCache;
  } catch {
    return undefined;
  } finally {
    interactionsCacheTimestamp = Date.now();
  }
});
