<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'
  import Prism from '$lib/Prism.svelte'
  import { formatDate } from '$lib/articles'

  export const hydrate = false

  export const load: Load = ({ props }) => ({
    props,
    stuff: { title: 'Articles' },
  })
</script>

<script lang="ts">
  export let articles: Array<{ path: string } & App.Stuff>
</script>

<main>
  {#each articles as { path, title, description, date, snippet }}
    <div class="card">
      {#if snippet}
        <Prism {...snippet} />
      {/if}
      <h2><a href="/articles/{path}" sveltekit:prefetch>{title}</a></h2>
      {#if description}<p>{description}</p>{/if}
      <p>{formatDate(date)}</p>
    </div>
  {/each}
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .card {
    position: relative;
    overflow: hidden;
    border-radius: 1em;
    box-shadow: 0 0 1em #888;

    :global(pre) {
      margin: 0;
      overflow: hidden;
    }

    h2 {
      padding: 0 1em;
    }

    a::before {
      position: absolute;
      inset: 0;
      content: '';
    }
  }
</style>
