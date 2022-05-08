<script lang="ts">
  export let name: string
  export let checked = false
</script>

<div class:checked>
  <label>
    <input type="checkbox" bind:checked />
    Hello {name}!
  </label>
</div>

<style lang="scss">
  div {
    font-size: 1.25em;
    font-variant: small-caps;
    border: 1px solid black;
    padding: 1em;
  }

  .checked {
    background: sandybrown;
  }
</style>
