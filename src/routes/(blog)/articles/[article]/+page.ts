import { articles } from "$lib/articles";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const load = articles.get(params.article);
  if (!load) throw error(404, "Article not found");

  const { metadata, banner, default: component } = await load();
  return { ...metadata, path: params.article, banner, component };
};
