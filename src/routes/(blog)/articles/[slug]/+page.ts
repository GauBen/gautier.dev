import { articles } from "$lib/articles";
import { error } from "@sveltejs/kit";

export const prerender = true;

export const entries = () => [...articles.keys()].map((slug) => ({ slug }));

export const load = async ({ params }) => {
  const article = articles.get(params.slug);
  if (!article) error(404, "Article not found");
  const { load, date } = article;
  const { frontmatter, banner, default: Article } = await load();
  return { ...params, ...frontmatter, date, banner, Article };
};
