<script lang="ts">
  import "../app.css";

  import technaUrl from "#assets/techna-sans.woff2?url";
  import oxprotoRegularUrl from "#assets/0xproto-regular.woff2?url";
  import oxprotoItalicUrl from "#assets/0xproto-italic.woff2?url";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  const { children } = $props();
</script>

<svelte:head>
  <link
    rel="alternate"
    type="application/atom+xml"
    title="gautier.dev articles"
    href={new URL(resolve("/(blog)/feed"), page.url.href).href}
  />
  {#each [technaUrl, oxprotoRegularUrl, oxprotoItalicUrl] as font}
    <link
      rel="preload"
      href={font}
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    />
  {/each}
</svelte:head>

{@render children()}
