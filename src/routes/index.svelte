<script lang="ts" context="module">
  import { formatDate } from '$lib/articles'
  import Prism from '$lib/Prism.svelte'
  import type { Load } from '@sveltejs/kit'

  export const hydrate = false

  export const load: Load = ({ props }) => ({
    props,
    stuff: { title: 'Gautier Ben Aïm' },
  })
</script>

<script lang="ts">
  import Card from '$lib/Card.svelte'
  import Header from '$lib/Header.svelte'

  export let articles: Array<{ path: string } & App.Stuff>
</script>

<Header />

<main>
  <h1>Latest articles</h1>
  <div class="grid">
    {#each articles as { path, title, description, date, snippet }}
      <Card>
        <svelte:fragment slot="header">
          {#if snippet}
            <div class="snippet">
              <Prism {...snippet} />
            </div>
          {/if}
        </svelte:fragment>
        <h2><a href="/articles/{path}" sveltekit:prefetch>{title}</a></h2>
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
  }

  h1 {
    margin-top: 2rem;
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .snippet {
    box-shadow: 0 0 0.25em #ccc;
  }
</style>
