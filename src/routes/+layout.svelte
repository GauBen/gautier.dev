<script lang="ts">
  import "../app.css";

  import technaUrl from "$assets/techna-sans.woff2?url";
  import oxprotoRegularUrl from "$assets/0xproto-regular.woff2?url";
  import oxprotoItalicUrl from "$assets/0xproto-italic.woff2?url";

  const { children } = $props();
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
</svelte:head>

{@render children()}
