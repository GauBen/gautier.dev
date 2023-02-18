<script lang="ts">
  import { formatDate } from '$lib/articles.js'
  import Card from '$lib/Card.svelte'
  import Header from '$lib/Header.svelte'
  import Prism from '$lib/Prism.svelte'
  import type { PageData } from './$types'

  export let data: PageData
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
  <div class="grid">
    {#each data.articles as { path, title, description, date, snippet }}
      <Card>
        <svelte:fragment slot="header">
          {#if snippet}
            <div class="snippet">
              <Prism {...snippet} />
            </div>
          {/if}
        </svelte:fragment>
        <h2>
          <a href="/articles/{path}">{title}</a>
        </h2>
        {#if description}<p>{description}</p>{/if}
        <p>{formatDate(date)}</p>
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

  .center {
    text-align: center;
  }

  .btn {
    display: inline-block;
    padding: 0.5em 1em;
    background-image: linear-gradient(var(--link), var(--link));
    background-repeat: no-repeat;
    background-position: right;
    background-size: 0 100%;
    border: 0.0625em solid var(--link);
    border-radius: 0.75em;
    border-radius: 1.3em;
    transition: 150ms color, 150ms background-size;

    &:hover,
    &:focus {
      color: white;
      background-position: left;
      background-size: 100% 100%;
      outline: none;
    }
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 1em 0;
  }

  .snippet {
    box-shadow: 0 0 0.25em #ccc;
  }
</style>
