<script lang="ts">
  import Card from "$lib/Card.svelte";
  import Header from "$lib/Header.svelte";
  import Prism from "$lib/Prism.svelte";
  import { formatDate } from "$lib/articles.js";
  import SearchBar from "./SearchBar.svelte";

  const escape = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

  const { data } = $props();
</script>

<Header />

<main>
  <h1>Hey!</h1>
  <p>
    My name is Gautier, I'm a French full stack web engineer, cybersecurity
    engineer, design enthusiast and hackathon organizer. I work full-time at
    <a href="https://escape.tech/">Escape</a>
    as a full stack web engineer. I graduated from
    <a href="https://en.wikipedia.org/wiki/ENSEEIHT">ENSEEIHT</a>
    in 2022 with a dual degree in computer science and cybersecurity.
  </p>
  <p>I sometimes write articles, you'll find them below.</p>

  <SearchBar {...data} />

  {#each data.articles as { slug, banner, title, description, date, snippet }}
    <Card>
      {#snippet header()}
        {#if banner}
          <enhanced:img
            src={banner}
            alt=""
            class="banner"
            style:view-transition-name={slug}
          ></enhanced:img>
        {:else if snippet}
          <div class="banner" style:view-transition-name={slug}>
            <Prism {...snippet} />
          </div>
        {/if}
      {/snippet}
      <h2>
        <a href="/articles/{slug}">{title}</a>
      </h2>
      {#if Array.isArray(description)}
        {#each description as line}
          {@const rendered = escape(line)
            .replaceAll(/\[hl\](.+?)\[\/hl\]/g, "<mark>$1</mark>")
            .replaceAll("\n", "<br />")}
          <p style="white-space: pre-wrap">{@html rendered}</p>
        {/each}
      {:else if description}
        <p>{description}</p>
      {/if}
      {#if date}
        <p><time datetime={date.toISOString()}>{formatDate(date)}</time></p>
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
    max-width: var(--main-width);
    padding: 0 0.5em;
    margin: 0 auto;
    overflow: hidden;
  }

  h1 {
    margin: 2rem 0 1rem;
  }

  .banner {
    box-shadow: 0 0 0.25em #0002;

    :global(pre) {
      margin: 0;
    }
  }
</style>
