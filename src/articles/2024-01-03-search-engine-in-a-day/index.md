---
draft: true
title: Building a search engine in a day
description: I built a search engine in a day for the very website you are reading this on.
---

<script>
  import Measure from './Measure.svelte'
  import Mermaid from '$lib/Mermaid.svelte'
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

In this article I will describe how I built an Algolia-like search engine in a day, with a naive yet effective ranking algorithm. **There are two parts to this search engine: the indexing and the searching.** The indexing is done at build time, and the searching is done client-side. The heavy lifting should be done at build time, so that the client-side search is fast.

These two steps work roughly as follows:

<Mermaid>
  flowchart LR
    Articles(Articles) -.-> Markdown
    SQ(Search Query) -.-> K2[Keywords]
    subgraph Indexing ["Indexing (build-time)"]
      Markdown -- parsed --> AST
      AST -- tokenized --> Tokens
      Tokens -- normalized --> Keywords
      Keywords -- weighted --> Index
    end
    Index --> Matching
    Matching -.-> SR(Search Results)
    subgraph Searching ["Searching (run-time)"]
      K2[Keywords] --> Matching
    end
</Mermaid>

## Indexing articles

All my articles are written in markdown, which is made easy to parse by the [remark parser](https://github.com/remarkjs/remark). The first step is to parse all the markdown files and normalize their text data into a format that can be easily processed for the next steps.

Let's take this sample markdown file:

```md
# This is a heading

This is a paragraph... with **important** words.
```

The first three indexing steps (parsing, tokenization and normalization) transform the markdown into a list of equally weighted extracts. The structure of this list maps the one of the markdown document. Each root node (heading, paragraph...) will map to one extract. Each extract is then a list of strings, with an associated weight. For instance, headings and bold words will have a higher weight than regular words.

```json
[
  // Two root nodes
  // 1. Heading
  [
    {
      "original": "This is a heading",
      "normalized": "this is a heading",
      "weight": 2
    }
  ],
  // 2. Paragraph
  [
    // The paragraph contains three text nodes of different weights:
    {
      "original": "This is a paragraph... with ",
      // The normalized extract is lowercase and without punctuation
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

The next step is to sum the weights of the extracts for each word, and store the result in a map. Words of this map are now known as _keywords_.

```json
{
  "this": 3,
  "is": 3,
  "a": 3,
  "heading": 2,
  "paragraph": 1,
  "with": 1,
  "important": 2,
  "words": 1
}
```

The final step is to favor rare keywords and remove too common ones. To do so, I use the following heuristics:

- If a keyword is present in more than half of the articles, it is removed.
- Divide the score of a keyword by the number of articles it can be found in.

To prevent absurdly large scores, I actually use the logarithm of the sum of the weights. This evens out the scores and makes the search results more relevant.

The resulting index produced is a map of maps:

```json
{
  // Maps keywords to matching articles
  "state": {
    // Each article is associated with the weight of the keyword
    "state-of-js": 14,
    "finite-state-automatons": 8
  },
  "automatons": {
    "finite-state-automatons": 12
  }
}
```

Therefore, searching for `state` will return the article `state-of-js` first, but `state automatons` will return `finite-state-automatons` first.

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
