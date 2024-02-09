import { articles } from "$lib/articles.js";
import { stringify } from "devalue";
import type { RootContent } from "mdast";
import { writeFileSync } from "node:fs";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

/** Markdown processor. */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter);

/**
 * A markdown block can be transformed into a list of tokens:
 *
 * ```md
 * This is very **important**.
 * ```
 *
 * Is transformed into:
 *
 * ```json
 * [
 *   {"original": "This is very ", "normalized": "this is very ", "weight": 1},
 *   {"original": "important",     "normalized": "important",     "weight": 2},
 *   {"original": ".",             "normalized": " ",             "weight": 1}
 * ]
 * ```
 *
 * When `normalized` is whitespace only, the token will be thrown away.
 */
type Token = {
  /** Original markdown content. */
  original: string;
  /** Normalized markdown content. */
  normalized: string;
  /** Weight of the block. For instance, headings weigh more than paragraphs. */
  weight: number;
};

/** Normalizes and create a token out of a string. */
const createToken = (original: string, weight: number): Token => ({
  original,
  normalized: original.toLowerCase().replaceAll(/[^a-z0-9']/gi, " "),
  weight,
});

/** Tokenizes a markdown AST element, recursively. @see {Token} */
const tokenizeAst = (child: RootContent, weight = 1): Token[] => {
  if (
    child.type === "text" ||
    child.type === "inlineCode" ||
    child.type === "code"
  )
    return [createToken(child.value, weight)];

  if (
    child.type === "heading" ||
    child.type === "strong" ||
    child.type === "emphasis" ||
    child.type === "link"
  )
    return child.children.flatMap((child) => tokenizeAst(child, weight + 1));

  if (
    child.type === "paragraph" ||
    child.type === "blockquote" ||
    child.type === "list" ||
    child.type === "table"
  )
    return child.children.flatMap((child) => tokenizeAst(child, weight));

  if (child.type === "listItem" || child.type === "tableRow") {
    return child.children
      .flatMap((child) => tokenizeAst(child, weight))
      .concat([createToken("\n", weight)]);
  }

  if (child.type === "tableCell") {
    return child.children
      .flatMap((child) => tokenizeAst(child, weight))
      .concat([createToken("\t", weight)]);
  }

  if (child.type === "html")
    return [{ original: " ", normalized: " ", weight }];

  return [];
};

/**
 * Transforms a markdown string into a list of tokens.
 *
 * The list keeps the order of the markdown blocks, named nodes.
 *
 * ```md
 * # Heading
 *
 * Hello **World**
 * ```
 *
 * Is transformed into:
 *
 * ```json
 * [
 *   // Document structure is preserved
 *   [
 *     { "original": "Heading", "normalized": "heading", "weight": 2 }
 *   ],
 *   [
 *     { "original": "Hello ", "normalized": "hello ", "weight": 1 },
 *     { "original": "World",  "normalized": "world",  "weight": 2 }
 *   ]
 * ]
 * ```
 *
 * Nodes with only whitespace are thrown away.
 */
const tokenizeMarkdown = (raw: string): Token[][] =>
  processor
    .parse(raw)
    .children.map((child) => tokenizeAst(child))
    .filter((node) => node.some(({ normalized }) => normalized.trim() !== ""));

/**
 * Transforms a list of nodes into a map of keywords with weights.
 *
 * ```json
 * [
 *   [
 *     { "original": "Hello ", "normalized": "hello ", "weight": 1 },
 *     { "original": "World",  "normalized": "world",  "weight": 2 }
 *   ]
 * ]
 * ```
 *
 * Is transformed into:
 *
 * ```json
 * {
 *   // Keywords are normalized and trimmed, a reference to the parent node is kept
 *   "hello": { "weight": 1, "nodes": [0] },
 *   "world": { "weight": 2, "nodes": [0] }
 * }
 * ```
 */
const parse = (nodes: Token[][]) => {
  const weightedKeywords = new Map<
    string,
    { weight: number; nodes: Set<number> }
  >();
  for (const [node, tokens] of nodes.entries()) {
    for (const { normalized, weight } of tokens) {
      // Split the normalized text into keywords on whitespace
      const keywords = normalized.split(" ");
      for (const keyword of keywords) {
        // Ignore the keyword if it does not start with a letter
        if (!keyword || keyword[0] < "a" || keyword[0] > "z") continue;

        const prev = weightedKeywords.get(keyword) ?? { weight: 0, nodes: [] };
        weightedKeywords.set(keyword, {
          // Increment the weight of the keyword and add a reference to the node
          weight: prev.weight + weight,
          nodes: new Set([...prev.nodes, node]),
        });
      }
    }
  }
  return weightedKeywords;
};

/**
 * Extracts all original and normalized text from nodes and puts them in a flat
 * array.
 *
 * ```md
 * # Heading
 *
 * Hello **World**
 * ```
 *
 * Is transformed into:
 *
 * ```json
 * ["Heading", "heading", "Hello World", "hello world" ]
 * ```
 */
const extract = (nodes: Token[][]) =>
  nodes.flatMap((entries) => [
    entries.map(({ original }) => original).join(""),
    entries.map(({ normalized }) => normalized).join(""),
  ]);

/** Transforms a map of articles to keywords into a map of keywords to articles. */
const reverseKeywordMapping = (
  indexedArticles: Array<{
    slug: string;
    keywords: Map<string, { weight: number; nodes: Set<number> }>;
  }>,
) => {
  /** Direct reverse map. */
  const keywordsToArticles = new Map<
    string,
    Array<{ slug: string; weight: number; nodes: Set<number> }>
  >();
  for (const { slug, keywords } of indexedArticles) {
    for (const [keyword, { weight, nodes }] of keywords) {
      keywordsToArticles.set(keyword, [
        ...(keywordsToArticles.get(keyword) ?? []),
        { slug, weight, nodes },
      ]);
    }
  }

  /**
   * Weighted reverse map. The score decreases as the number of matching
   * articles increases, effectively favoring rare keywords.
   */
  const weightedKeywords = new Map<
    string,
    Array<{ slug: string; score: number; nodes: Set<number> }>
  >();
  for (const [keyword, matchingArticles] of keywordsToArticles) {
    const matches = matchingArticles.length;

    // Ignore keywords that are too common (> half of articles)
    if (matches > indexedArticles.length / 2) continue;

    weightedKeywords.set(
      keyword,
      matchingArticles
        .sort((a, z) => z.weight - a.weight)
        .map(({ slug, weight, nodes }) => ({
          slug,
          // Multiply the result by 5 to get a nice integer score
          score: Math.ceil((5 * weight) / Math.cosh(matches - 1.5)),
          nodes,
        }))
        .sort((a, z) => z.score - a.score),
    );
  }
  return weightedKeywords;
};

// Use all these functions to create a search index for the articles
console.time("Index articles");

// Index all articles
const indexedArticles = await Promise.all(
  [...articles].map(async ([slug, { raw, load }]) => {
    const { metadata } = await load();
    const nodes = tokenizeMarkdown(await raw());

    if (metadata.draft) return null;

    // Add the title and description to the index
    if (metadata.description)
      nodes.unshift([createToken(metadata.description, 2)]);
    nodes.unshift([createToken(metadata.title, 4)]);

    return { slug, metadata, keywords: parse(nodes), extracts: extract(nodes) };
  }),
).then((articles) => articles.filter(Boolean));

// Parse all tokens into keyword maps
const weightedKeywords = reverseKeywordMapping(indexedArticles);

// Compress and save the weighted keywords
const compressedWeightedKeywords = stringify(
  Object.fromEntries(
    [...weightedKeywords]
      .sort(
        (a, z) =>
          z[1].reduce((acc, { score }) => acc + score, 0) -
          a[1].reduce((acc, { score }) => acc + score, 0),
      )
      .map(([keyword, articles]) => [
        keyword,
        articles.flatMap(({ slug, score, nodes }) => [slug, score, [...nodes]]),
      ]),
  ),
);
writeFileSync(
  new URL("search/keywords.json", import.meta.url),
  compressedWeightedKeywords,
);

// Compress and save the extracts
const compressedExtracts = stringify(
  Object.fromEntries(
    indexedArticles.map(({ slug, extracts }) => [slug, extracts]),
  ),
);
writeFileSync(
  new URL("search/extracts.json", import.meta.url),
  compressedExtracts,
);

// Not used for search but useful for other purposes
writeFileSync(
  new URL("search/metadata.json", import.meta.url),
  JSON.stringify(
    Object.fromEntries(
      indexedArticles.map(({ slug, metadata }) => [slug, metadata]),
    ),
  ),
);

console.timeEnd("Index articles");
