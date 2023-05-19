<script lang="ts">
  import mermaid from 'mermaid'

  const mermaidify = (node: HTMLElement) => {
    void mermaid.run({ nodes: [node] })
  }
</script>

<div use:mermaidify><slot /></div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;

    // Mermaid sets data-processed=true when the diagram is ready
    &:not([data-processed='true']) {
      padding: 0.5em;
      white-space: pre;
      opacity: 0.5;

      &::before {
        font-weight: bold;
        content: 'Diagram loading...';
      }
    }
  }
</style>
