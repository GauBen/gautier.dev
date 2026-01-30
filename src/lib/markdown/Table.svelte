<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";

  const {
    children,
    thead,
    ...props
  }: SvelteHTMLElements["div"] & { thead?: Snippet } = $props();
</script>

<div {...props} style="max-width: 100%; overflow: auto">
  <table>
    {#if thead}
      <thead>
        {@render thead?.()}
      </thead>
    {/if}
    <tbody>
      {@render children?.()}
    </tbody>
  </table>
</div>
