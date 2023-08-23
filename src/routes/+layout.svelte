<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/stores";
  import { inject } from "@vercel/analytics";
  import "../app.scss";

  inject({ mode: dev ? "development" : "production" });

  $: ({ title, description } = $page.data);
</script>

<svelte:head>
  <title>{title ? `${title} – gautier.dev` : "gautier.dev"}</title>
  <meta property="og:title" content={title} />
  {#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<slot />
