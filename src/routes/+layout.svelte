<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import { inject } from "@vercel/analytics";
  import "../app.scss";
  import "virtual:uno.css";

  inject({ mode: dev ? "development" : "production" });

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
