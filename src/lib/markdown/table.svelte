<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";

  const { children, ...props } = $props<
    { children: Snippet } & SvelteHTMLElements["div"]
  >();
</script>

<div {...props}>
  <table>
    {@render children()}
  </table>
</div>

<style>
  div {
    max-width: 100%;
    overflow: auto;
  }
</style>
