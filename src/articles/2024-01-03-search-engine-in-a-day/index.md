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

How hard can it be to build a search engine? I had no idea until a few days ago, when I decided to build one for this very website. The constraints are quite different from a _general_ search engine, but I still learned a lot:

- No need to crawl the web, I already have all the data.
- The whole search engine should be able to run client-side.
- It should be small and fast.

<Measure />
