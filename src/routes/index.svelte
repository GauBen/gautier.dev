<script context="module">
  export const hydrate = false
</script>

<script lang="ts">
  export let articles: Array<{
    path: string
    title: string
    snippet: { code: string }
  }>
</script>

<svelte:head>
  <title>Articles</title>
</svelte:head>

<main>
  {#each articles as { path, title, snippet }}
    <div class="card">
      {#if snippet}
        <pre>{snippet.code}</pre>
      {/if}
      <h2><a href={path} sveltekit:prefetch>{title}</a></h2>
    </div>
  {/each}
</main>

<style lang="scss">
  main {
    display: flex;
    gap: 1em;
    flex-direction: column;
  }

  .card {
    position: relative;
    box-shadow: 0 0 1em #888;
    border-radius: 1em;
    overflow: hidden;

    h2 {
      padding: 0 1em;
    }

    pre {
      margin: 0;
      padding: 1em;
      background: rgb(48, 11, 63);
      color: #fff;
    }

    a::before {
      content: '';
      position: absolute;
      inset: 0;
    }
  }
</style>
