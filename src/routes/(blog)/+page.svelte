<script lang="ts">
  import { resolve } from "$app/paths";
  import { formatDate } from "$lib/articles.js";
  import Card from "$lib/Card.svelte";
  import Header from "$lib/Header.svelte";
  import Chats from "@iconify-svelte/ph/chats-circle-duotone";
  import Heart from "@iconify-svelte/ph/heart-duotone";
  import external from "../../articles/external.json" assert { type: "json" };
  import SearchBar from "./SearchBar.svelte";
  import { getSnippet } from "./snippet.remote.js";

  const escape = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

  const { data } = $props();

  // data.interactions can be a Promise or the actual data (from the cache)
  const getInteractions = (() => {
    let interactions = $state<Awaited<typeof data.interactions>>();

    if (data.interactions && "then" in data.interactions)
      data.interactions.then((i) => (interactions = i));
    else interactions = data.interactions;

    return (title: string) =>
      interactions?.get(title) ?? { comments: 0, reactions: 0 };
  })();
</script>

<Header />

<main>
  <h1>Hey!</h1>
  <p>
    My name is Gautier, I'm a <a href={resolve("/resume")}>developer advocate</a
    >, full-stack engineer, cybersecurity specialist, design enthusiast and
    hackathon organizer. I work full-time at
    <a href="https://www.jahia.com/">Jahia</a>
    as Developer Advocate. I used to work at
    <a href="https://escape.tech/">Escape (YC W23)</a>
    as Full-Stack Engineer. I graduated from
    <a href="https://en.wikipedia.org/wiki/ENSEEIHT">ENSEEIHT</a>
    with a dual degree in computer science and cybersecurity.
  </p>
  <p>I sometimes write articles, you'll find them below.</p>

  <nav>
    On this site:<code>
      {" "}· <a href={resolve("/about")}>/about</a>
      · <a href={resolve("/resume")}>/resume</a>
      · <a href={resolve("/self-hosted")}>/self-hosted</a>
    </code>
  </nav>

  <SearchBar {...data} />

  {#each data.articles as { slug, banner, title, description, date, snippet } (slug)}
    {@const { comments, reactions } = getInteractions(title)}
    <Card>
      {#snippet header()}
        {#if banner}
          <enhanced:img src={banner} alt="" class="banner" />
        {:else if snippet}
          <div class="banner">
            <pre class="language-{snippet.lang}">{@html await getSnippet(
                slug,
              )}</pre>
          </div>
        {/if}
      {/snippet}
      <h2>
        <a href={resolve(`/articles/${slug}`)}>{title}</a>
      </h2>
      {#if Array.isArray(description)}
        {#each description as line (line)}
          {@const rendered = escape(line)
            .replaceAll(/\[hl\](.+?)\[\/hl\]/g, "<mark>$1</mark>")
            .replaceAll("\n", "<br />")}
          <p style="white-space: pre-wrap">{@html rendered}</p>
        {/each}
      {:else if description}
        <p>{description}</p>
      {/if}
      {#if date}
        <p style="display: flex; justify-content: space-between">
          <time datetime={date.toISOString()}>{formatDate(date)}</time>
          {#if comments + reactions > 0}
            <span>
              {#if reactions > 0}
                {reactions}
                <Heart class="icon" aria-label="reactions" />
              {/if}
              {#if comments > 0}
                {comments}
                <Chats class="icon" aria-label="comments" />
              {/if}
            </span>
          {/if}
        </p>
      {:else}
        <p>Unpublished draft</p>
      {/if}
    </Card>
  {:else}
    <p>No articles match <strong>{data.q}</strong></p>
  {/each}

  {#if data.q === undefined}
    <h2 style="margin-block-start: 2rem">Corporate articles</h2>
    <p>
      These are the articles I have written for corporate blogs. They contain
      sponsored content and should be regarded as such.
    </p>

    <div class="grid">
      {#each external as { title, url, banner, date, description } (url)}
        <Card>
          {#snippet header()}
            <img src={banner} alt="" class="banner" loading="lazy" />
          {/snippet}
          <h2>
            <a href={url} rel="external sponsored">{title}</a>
          </h2>
          <p>{description}</p>
          <p>
            <time datetime={new Date(date).toISOString()}>
              {formatDate(new Date(date))}
            </time> for Escape
          </p>
        </Card>
      {/each}
    </div>
  {/if}
</main>

<style lang="scss">
  main {
    padding: 0 0.5em;
    margin: 0 auto;
    contain: paint;

    > :global(*) {
      max-width: var(--main-width);
      margin-inline: auto;
    }
  }

  h1 {
    margin: 2rem auto 1rem;
  }

  .banner {
    box-shadow: 0 0 0.25em #0002;

    :global(pre) {
      margin: 0;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
    margin-block: 1rem;

    > :global(*) {
      margin: 0;
    }
  }
</style>
