<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";

  const { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div {...props}>
  <table>
    {#if children}{@render children()}{/if}
  </table>
</div>

<style>
  div {
    max-width: 100%;
    overflow: auto;
  }
</style>
