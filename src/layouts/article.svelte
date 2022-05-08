<script>
  export let title = ''
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<slot />

<p><a href="/articles">Back to the article list</a></p>
