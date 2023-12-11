<script lang="ts">
  import { formatDate } from "$lib/articles.js";
  import Card from "$lib/Card.svelte";
  import Header from "$lib/Header.svelte";
  import Prism from "$lib/Prism.svelte";

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
  <p>
    I sometimes write code that I find <em>aesthetically pleasing</em> so I write
    articles about it. You'll find them below.
  </p>
  <h2>Latest articles</h2>
  <div class="list">
    {#each data.articles as { slug, banner, title, description, date, snippet }}
      <Card>
        {#snippet header()}
          {#if banner}
            <enhanced:img
              src={banner}
              alt=""
              class="banner"
              style:view-transition-name={slug}
            />
          {:else if snippet}
            <div class="banner" style:view-transition-name={slug}>
              <Prism {...snippet} />
            </div>
          {/if}
        {/snippet}
        <h2>
          <a href="/articles/{slug}">{title}</a>
        </h2>
        {#if description}<p>{description}</p>{/if}
        <p><time datetime={date.toISOString()}>{formatDate(date)}</time></p>
      </Card>
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    max-width: var(--main-width);
    padding: 0 0.5em;
    margin: 0 auto;
    overflow: hidden;
  }

  h1,
  h2 {
    margin: 2rem 0 1rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 1em 0;
  }

  .banner {
    box-shadow: 0 0 0.25em #0002;

    :global(pre) {
      margin: 0;
    }
  }
</style>
