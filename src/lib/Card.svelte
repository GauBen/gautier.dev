<script lang="ts">
  import type { Snippet } from "svelte";

  const { header, children }: { header?: Snippet; children: Snippet } =
    $props();
</script>

<div class="card">
  {@render header?.()}
  <div class="body">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .card {
    position: relative;
    margin-block: 1rem;
    overflow: hidden;
    border-radius: 0.5em;
    box-shadow: 0 0 0.5em #0002;

    :global(a::before) {
      position: absolute;
      inset: 0;
      content: "";
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      padding: 1rem;

      > :global(*) {
        margin: 0;
      }
    }
  }
</style>
