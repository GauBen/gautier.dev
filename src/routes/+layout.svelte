<script lang="ts">
  import { dev } from "$app/environment";
  import { onNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { inject } from "@vercel/analytics";
  import "../app.scss";

  inject({ mode: dev ? "development" : "production" });

  $: ({ title, description } = $page.data);

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <title>{title ? `${title} – gautier.dev` : "gautier.dev"}</title>
  <meta property="og:title" content={title} />
  {#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<slot />
