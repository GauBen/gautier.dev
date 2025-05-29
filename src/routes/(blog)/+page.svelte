<script lang="ts">
  import { formatDate } from "$lib/articles.js";
  import Card from "$lib/Card.svelte";
  import Header from "$lib/Header.svelte";
  import Prism from "$lib/Prism.svelte";
  import SearchBar from "./SearchBar.svelte";

  const escape = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

  const { data } = $props();

  let commentCounts = $state<Map<string, number>>();
  $effect(() => {
    data.commentCounts.then((c) => {
      commentCounts = c;
    });
  });
</script>

<Header />

<main>
  <h1>Hey!</h1>
  <p>
    My name is Gautier, I'm a developer advocate, full-stack engineer,
    cybersecurity specialist, design enthusiast and hackathon organizer. I work
    full-time at
    <a href="https://www.jahia.com/">Jahia</a>
    as Developer Advocate. I used to work at
    <a href="https://escape.tech/">Escape (YC W23)</a>
    as Full-Stack Engineer. I graduated from
    <a href="https://en.wikipedia.org/wiki/ENSEEIHT">ENSEEIHT</a>
    with a dual degree in computer science and cybersecurity.
  </p>
  <p>I sometimes write articles, you'll find them below.</p>

  <SearchBar {...data} />

  {#each data.articles as { external, slug, banner, title, description, date, snippet } (slug)}
    {@const comments = commentCounts?.get(title) ?? 0}
    <Card>
      {#snippet header()}
        {#if banner && external}
            <img src={banner} alt="" class="banner" />
        {:else if banner}
            <enhanced:img src={banner} alt="" class="banner" />
        {:else if snippet}
          <div class="banner">
            <Prism {...snippet} />
          </div>
        {/if}
      {/snippet}
      <h2>
        <a href={external ?? `/articles/${slug}`}>{title}</a>
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
          {#if comments > 0}
            <span>
              {comments}
              <span class="i-ph:chats-circle-duotone">comments</span>
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
</style>
