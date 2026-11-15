<script lang="ts">
  import "../app.css";

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
</svelte:head>

{@render children()}
