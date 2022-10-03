<script lang="ts" context="module">
</script>

<script lang="ts">
  import mermaid from 'mermaid'
  import { onMount } from 'svelte'

  let diagram: HTMLElement

  onMount(() => {
    mermaid.init(diagram)
  })
</script>

<div bind:this={diagram}><slot /></div>

<style lang="scss">
  div {
    display: flex;
    justify-content: center;
    width: auto;
  }
</style>
