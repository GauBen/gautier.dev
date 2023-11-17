<script lang="ts">
  const { header, children } = $props<{
    header?: () => void;
    children: () => void;
  }>();
</script>

<div class="card">
  {#if header}
    {@render header()}
  {/if}
  <div class="body">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .card {
    position: relative;
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
