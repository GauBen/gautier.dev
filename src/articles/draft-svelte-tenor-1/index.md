---
title: Releasing svelte-tenor 1.0
---

<script>
  import sadCat from './sad-cat.avif';
</script>

I've released the first version of [svelte-tenor](https://www.npmjs.com/package/svelte-tenor) in September 2021, as a dependency for a personal project. It hasn't seen much change since then, and is still stuck on Svelte 3 and Tenor API v1. Since I don't use it anymore, I wasn't interested in updating it. This changed with the [announcement of Svelte 5 and the new runes API](https://svelte.dev/blog/runes). I've encountered a bit of friction with Svelte 3 reactivity design, and I'm hoping that runes will help with that. I've decided to update svelte-tenor to Svelte 5 and Tenor API v2, not because I need it, but because I have a lot of new things to learn about Svelte 5 and I'm hoping that this project will help me with that.

## Taking a look at Tenor's new API

I remembered that the v1 API was not greatly designed, but I'm flabbergasted to see that they didn't fix anything while pushing breaking changes.

The documentation does not accurately describe the API results:

- Some fields are missing in the response: [hascaption](https://developers.google.com/tenor/guides/response-objects-and-errors#hascaption-response-object) is not present in the response yet not marked as optional
- Some field types are wrong: [flags](https://developers.google.com/tenor/guides/response-objects-and-errors#flags-response-object) is documented as string but is actually an array
- "The transparent formats are for sticker content and aren't available in GIF search results." is not true, they are _sometimes_ defined in GIF responses, and seem to be the only way to get WebP images instead of GIF.
- [The list of type](https://developers.google.com/tenor/guides/response-objects-and-errors#format-types) is nowhere near complete, as I've found `nanogifpreview`, `tinywebppreview_transparent` and others in the wild.

It's literally **impossible to use the API without carefully testing every single field** of every single response. This is not a good developer experience. I'll be using [zod](https://zod.dev/) during development to find inconsistencies between the documentation and the actual API responses.

I'm also disappointed that Tenor is not pushing harder for new image formats instead of sticking to GIF. It's about time we use WebP or avif, as they are lighter and easier on the CPU.

For instance, 20 "tinygifs" weight 2.99MB in total, while 19 "tinywebps" weight 942kB. One is missing because for some reasons it's not available in WebP format.

I tried to convert the [missing GIF](https://tenor.com/view/sad-cat-face-sad-face-cute-gif-26023855) to AVIF with [ezgif](https://ezgif.com/gif-to-avif/) and the results are even more impressive:

- Highest quality GIF: **10.79MiB**, width: 498px, height: 498px, frames: 79
- Converted AVIF Result: **273.42KiB (-97.53%)**, width: 498px, height: 498px, frames: 79

DAMN! **Tenor should definitely push for AVIF support.**

<figure>
  <picture>
    <source srcset={sadCat} type="image/avif" />
    <img src="https://media.tenor.com/-DY1sCSEXqUAAAAC/sad-cat.gif" alt="Sad Cat GIF" loading="lazy">
  </picture>
  <figcaption>A 280kB AVIF image or a 11MB GIF image <a href="https://caniuse.com/avif">depending on your browser</a></figcaption>
</figure>

## Rewriting in Svelte 5

The 0.2 version contains 11 Svelte components and 3 TypeScript files (for API calls), for a total of about 1600 lines of code. This should ba a pretty fast rewrite.

```
$ npx cloc src/lib
      14 text files.
      14 unique files.
       0 files ignored.

github.com/AlDanial/cloc v 1.98  T=0.01 s (1056.5 files/s, 131312.6 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
Svelte                          11            114              0⁕           942
TypeScript                       3             45            219            420
-------------------------------------------------------------------------------
SUM:                            14            159            219           1362
-------------------------------------------------------------------------------

⁕ Svelte files are parsed as HTML, thus ignoring JS comments
```

I'll start with the API files, as the goal is to support the new Tenor API v2. It looks like I'll still be fixing API responses, as the documentation is still wrong. `raw-api` vs `api` is not going away anytime soon. I will also add support for stickers, as this is one of the new features of the v2 API.

### Never trust the documentation

I want to verify API responses with zod, but only in development. Targeting dev environments is made really simple thanks to [esm-env](https://github.com/benmccann/esm-env), written as a simple `import { DEV } from "esm-env";`.
