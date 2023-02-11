<script lang="ts" context="module">
</script>

<script lang="ts">
  import mermaid from 'mermaid'

  const mermaidify = (node: HTMLElement) => {
    mermaid.init({}, node)
  }
</script>

<div use:mermaidify><slot /></div>

<style lang="scss">
  div {
    display: flex;
    justify-content: center;
    width: auto;
  }
</style>
