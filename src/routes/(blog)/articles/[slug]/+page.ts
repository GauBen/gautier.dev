import { articles } from "$lib/articles";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const article = articles.get(params.slug);
  if (!article) error(404, "Article not found");
  const { load, date } = article;
  const { metadata, banner, default: Article } = await load();
  return { ...params, ...metadata, date, banner, Article };
};
