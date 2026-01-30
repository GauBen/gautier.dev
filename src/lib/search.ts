import { articles, type Article } from "$lib/articles.js";
import extractsRaw from "$search/extracts.json?raw";
import keywordsRaw from "$search/keywords.json?raw";
import metadataRaw from "$search/metadata.json?raw";
import { parse } from "devalue";

/** Number of characters on each side of an highlight. */
const extractMargin = 60;

/** Indexed keywords. */
export const weightedKeywords = new Map(
  Object.entries<unknown[]>(parse(keywordsRaw)).map(([keyword, entries]) => [
    keyword,
    Array.from({ length: entries.length / 3 }, (_, i) => ({
      slug: entries[i * 3] as string,
      score: entries[i * 3 + 1] as number,
      nodes: entries[i * 3 + 2] as number[],
    })),
  ]),
);

/** Maps articles to relevant text nodes. */
export const extracts = new Map(
  Object.entries<unknown[]>(parse(extractsRaw)).map(([slug, entries]) => [
    slug,
    Array.from({ length: entries.length / 2 }, (_, i) => ({
      original: entries[i * 2] as string,
      normalized: entries[i * 2 + 1] as string,
    })),
  ]),
);

export const metadata = JSON.parse(metadataRaw) as Record<
  string,
  Article["frontmatter"]
>;

/** Lowercases and removes non alphanumeric characters from input. */
const normalize = (str: string) =>
  str.toLowerCase().replaceAll(/[^a-z0-9']/gi, " ");

export const search = (q: string) => {
  const normalized = normalize(q);
  const terms = new Set(normalized.trim().replaceAll(/ +/g, " ").split(" "));

  // Retrieve all valid keywords in the query
  const keywords = [...terms].map<
    [string, Map<string, { score: number; nodes: number[] }>]
  >((term) => [
    term,
    new Map(
      weightedKeywords
        .get(term)
        ?.map(({ slug, score, nodes }) => [slug, { score, nodes }]),
    ),
  ]);

  // Find all articles that match all keywords, and sort them by score
  const matches = [...articles]
    .reduce<
      Array<{
        slug: string;
        score: number;
        matchingNodes: Array<{ keyword: string; nodes: number[] }>;
      }>
    >((matches, [slug]) => {
      let score = 0;
      const matchingNodes = [];
      for (const [keyword, matchingArticles] of keywords) {
        const match = matchingArticles.get(slug);
        if (!match) return matches;
        score += match.score;
        matchingNodes.push({ keyword, nodes: match.nodes });
      }
      return [...matches, { slug, score, matchingNodes }];
    }, [])
    .sort((a, z) => z.score - a.score);

  // Provide autocomplete suggestions for the last word
  const last = [...terms][terms.size - 1];
  const lastWordComplete = normalized.endsWith(" ");
  const fullKeywords = keywords.slice(0, lastWordComplete ? undefined : -1);
  const autocomplete = [];
  for (const [keyword, matchingArticles] of weightedKeywords) {
    if (terms.has(keyword)) continue;

    // Articles matching all complete keywords
    const matches = new Set(
      [...articles]
        .filter(([slug]) =>
          fullKeywords.every(([, matchingArticles]) =>
            matchingArticles.has(slug),
          ),
        )
        .map(([slug]) => slug),
    );

    // Suggest the end of keywords that match at least one article
    if (
      !lastWordComplete &&
      keyword.startsWith(last) &&
      keyword !== last &&
      matchingArticles.some(({ slug }) => matches.has(slug))
    )
      autocomplete.push(keyword.slice(last.length));

    // Suggest new keywords that match at least one article
    if (
      matchingArticles.some(({ slug }) =>
        [...matches]
          .filter((match) =>
            weightedKeywords.get(last)?.some(({ slug }) => slug === match),
          )
          .includes(slug),
      )
    )
      autocomplete.push(" " + keyword);

    // Limit the number of suggestions
    if (autocomplete.length >= 4) break;
  }

  // Create extracts for each article
  const results = matches.map(({ slug, matchingNodes }) => {
    // Compute all possible combinations of matching nodes and get the best one
    let combinations = matchingNodes[0].nodes.map((t) => [t]);
    for (const { nodes } of matchingNodes.slice(1)) {
      combinations = (
        combinations.length < 1000 ? nodes : nodes.slice(0, 1)
      ).flatMap((t) => combinations.map((combination) => [...combination, t]));
    }
    const [best] = combinations
      .map((combination) => ({
        combination,
        distance: Math.max(...combination) - Math.min(...combination),
      }))
      .sort((a, z) => a.distance - z.distance);
    const nodesToExtract = best.combination
      .map((node, i) => ({ keyword: matchingNodes[i].keyword, node }))
      .sort((a, z) => a.node - z.node);

    // Map nodes of interest to their keywords
    const nodesToKeywords = new Map<number, string[]>();
    for (const { keyword, node } of nodesToExtract) {
      nodesToKeywords.set(node, [
        ...(nodesToKeywords.get(node) ?? []),
        keyword,
      ]);
    }

    // Create extracts from nodes of interest
    const highlightedExtracts = [...nodesToKeywords].map(([node, keywords]) => {
      const { original, normalized } = extracts.get(slug)![node];

      // Find the keyword in the normalized text and keep its position
      const ranges = keywords
        .map<[number, number]>((keyword) => {
          if (normalized.startsWith(keyword + " ")) return [0, keyword.length];
          if (normalized.endsWith(" " + keyword))
            return [normalized.length - keyword.length, keyword.length];
          const pos = normalized.indexOf(" " + keyword + " ");
          if (pos >= 0) return [pos + 1, keyword.length];
          return [normalized.indexOf(keyword), keyword.length];
        })
        .sort((a, z) => a[0] - z[0]);

      // Start of the extract
      let i = 0;
      if (ranges[0][0] > extractMargin) {
        i =
          normalized.lastIndexOf(
            " ",
            ranges[0][0] -
              extractMargin -
              // In case the extract is close to the end, we double the margin at the start
              Math.max(
                ranges[0][0] + ranges[0][1] + extractMargin - normalized.length,
                0,
              ),
          ) + 1;
      }
      let out = i === 0 ? "" : "...";
      for (const [start, length] of ranges) {
        if (start - i < extractMargin * 2) {
          // If the previous and current keywords are close, don't add ellipsis
          out += original.slice(i, start);
        } else {
          out +=
            original.slice(i, normalized.indexOf(" ", i + extractMargin)) +
            " ... " +
            original.slice(
              normalized.lastIndexOf(" ", start - extractMargin) + 1,
              start,
            );
        }
        i = start + length;

        // Append the highlighted keyword
        out += `[hl]${original.slice(start, i)}[/hl]`;
      }
      const end = ranges[ranges.length - 1][0] + ranges[ranges.length - 1][1];
      if (normalized.length - end < extractMargin) {
        out += original.slice(i);
      } else {
        out +=
          original.slice(
            i,
            normalized.indexOf(
              " ",
              end +
                extractMargin +
                // In case the extract is close to the start, we double the margin at the end
                Math.max(0, extractMargin - ranges[ranges.length - 1][0]),
            ),
          ) + "...";
      }
      return out;
    });

    return { slug, highlightedExtracts };
  });

  return { results, autocomplete };
};
