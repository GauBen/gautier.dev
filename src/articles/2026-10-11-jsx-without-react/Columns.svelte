<script lang="ts">
  import type { Snippet } from "svelte";

  const { children }: { children?: Snippet } = $props();
</script>

<div class="columns">{@render children?.()}</div>

<style>
  @media (width >= 82rem) {
    .columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 80rem;
    }
  }
</style>
