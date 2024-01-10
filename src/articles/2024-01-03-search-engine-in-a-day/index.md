---
draft: true
title: Building a search engine in a day
description: I built a search engine in a day for the very website you are reading this on.
---

<script>
  import Measure from './Measure.svelte'
</script>

> How is [Marginalia](https://search.marginalia.nu/), a search engine built by a single person, so good?
>
> -- [How bad are search results? by Dan Luu](https://danluu.com/seo-spam/)

How hard can it be to build a search engine? I had no idea until a few days ago, when I decided to build one for this very website. The constraints are quite different from a _general_ search engine:

- No need to crawl the web, I already have all the data.
- The whole search engine should be able to run client-side.
- It should be small and fast.

Here is how small and fast it is to load the whole search engine and associated data:

<Measure />

In this article I will describe how I built an Algolia-like search engine in a day, with a naive yet effective ranking algorithm. There are two parts to this search engine: the indexing and the searching. The indexing is done at build time, and the searching is done client-side. The heavy lifting should be done at build time, so that the client-side search is fast.

## Indexing articles

All my articles are written in markdown, which is easy to read thanks to the [remark parser](https://github.com/remarkjs/remark). The first step is to parse all the markdown files and normalize their text data into a format that is easy to process.

```md
# This is a heading

This is a paragraph... with **important** words.
```

```json
[
  [
    {
      "original": "This is a heading",
      "normalized": "this is a heading",
      "weight": 2
    }
  ],
  [
    {
      "original": "This is a paragraph... with ",
      "normalized": "this is a paragraph    with ",
      "weight": 1
    },
    {
      "original": "important",
      "normalized": "important",
      "weight": 2
    },
    {
      "original": " words.",
      "normalized": " words ",
      "weight": 1
    }
  ]
]
```

```ts
/** Markdown processor. */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter);

/** Normalizes and create a token out of a string. */
const tokenize = (original: string, weight: number) => ({
  original,
  normalized: original.toLowerCase().replaceAll(/[^a-z0-9']/gi, " "),
  weight,
});

/** Tokenizes a markdown AST element, recursively. */
const tokenizeAst = (child: RootContent, weight = 1) => {
  if (child.type === "text") return [tokenize(child.value, weight)];

  if (child.type === "heading" || child.type === "strong")
    return child.children.flatMap((child) => tokenizeAst(child, weight + 1));

  if (child.type === "paragraph")
    return child.children.flatMap((child) => tokenizeAst(child, weight));

  return [];
};

/** Transforms a markdown string into a list of tokens. */
const tokenizeMarkdown = (raw: string) =>
  processor.parse(raw).children.map((child) => tokenizeAst(child));
```

The whole indexer [can be found on GitHub](https://github.com/GauBen/gautier.dev/blob/main/src/index-articles.ts).

## Searching the index

```ts
// Find all articles that match all keywords, and sort them by score
const matches = [...articles]
  .reduce((matches, [slug]) => {
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
```

The whole search algorithm [can be found on GitHub](https://github.com/GauBen/gautier.dev/tree/main/src/lib/search.ts).
