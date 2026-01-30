import { prerender } from "$app/server";
import { articles } from "$lib/articles.js";
import { highlight } from "$lib/prism.js";

export const getSnippet = prerender("unchecked", async (slug: string) => {
  const article = await articles.get(slug)?.load();
  if (!article || !article.frontmatter.snippet) return "";
  const { code, lang } = article.frontmatter.snippet;
  return highlight(code, lang);
});
