export const load = async ({ data, url }) => {
  const q = url.searchParams.get("q")?.slice(0, 100);
  if (q === undefined) return data;

  const { search } = await import("$lib/search.js");
  const { results, autocomplete } = search(q);
  const map = new Map(data.articles.map((article) => [article.slug, article]));

  return {
    ...data,
    q,
    autocomplete,
    articles: q
      ? results.map(({ slug, highlightedExtracts }) => ({
          ...map.get(slug)!,
          description: highlightedExtracts,
        }))
      : data.articles,
  };
};
