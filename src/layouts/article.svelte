<script>
  export let title = ''

  /** @type {{code: string, lang: string} | undefined} */
  export let snippet = undefined
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{#if snippet}
  <pre>{snippet.code}</pre>
{/if}

<slot />

<p><a href="/" sveltekit:prefetch>Back to the article list</a></p>
