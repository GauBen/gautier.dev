<script lang="ts">
  import { page } from "$app/state";
  import "../app.scss";
  import "virtual:uno.css";

  const { children } = $props();
  const { title, description } = $derived(page.data);
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

{@render children()}
