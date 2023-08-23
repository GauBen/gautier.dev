<script lang="ts">
  export let title: string | false = "Example";
</script>

<div>
  {#if title}
    <span>{title}</span>
  {/if}
  <slot />
</div>

<style lang="scss">
  div {
    position: relative;
    min-height: 100%;
    padding: 2em;
    border: 2px solid #666;
    border-radius: 2px;
  }

  span {
    position: absolute;
    top: -1px;
    left: -1px;
    padding: 0 0.5em;
    color: white;
    background-color: #666;
    border-bottom-right-radius: 2px;
  }
</style>
