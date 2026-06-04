<script lang="ts">
  import { page } from "$app/state";
  import "../app.css";

  import technaUrl from "$assets/techna-sans.woff2?url";
  import oxprotoRegularUrl from "$assets/0xproto-regular.woff2?url";
  import oxprotoItalicUrl from "$assets/0xproto-italic.woff2?url";

  const { children } = $props();
  const { title, description } = $derived(page.data);
</script>

<svelte:head>
  {#each [technaUrl, oxprotoRegularUrl, oxprotoItalicUrl] as font}
    <link
      rel="preload"
      href={font}
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    />
  {/each}
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
