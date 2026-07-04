<script lang="ts">
  const { title, description }: { title?: string; description?: string } =
    $props();
</script>

<svelte:head>
  {#if title}
    <title>{title} – gautier.dev</title>
    <meta property="og:title" content={title} />
  {/if}
  {#if description}
    <meta name="description" content={description} />
    <meta property="og:description" content={description} />
  {/if}
</svelte:head>
