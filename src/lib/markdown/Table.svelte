<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";

  const { children, ...props }: SvelteHTMLElements["div"] = $props();
</script>

<div {...props} style="max-width: 100%; overflow: auto">
  <table>
    <tbody>
      {@render children?.()}
    </tbody>
  </table>
</div>
