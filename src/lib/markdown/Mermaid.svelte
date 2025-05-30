<script lang="ts">
  import type { Attachment } from "svelte/attachments";

  const mermaidify: Attachment<HTMLElement> = (node) => {
    // Remove SSR landmarks
    node.innerHTML = node.textContent!;
    // Import mermaid client-side only
    import("mermaid").then((mermaid) => mermaid.default.run({ nodes: [node] }));
  };
</script>

<div {@attach mermaidify}><slot /></div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;

    // Mermaid sets data-processed=true when the diagram is ready
    &:not(:global([data-processed])) {
      padding: 0.5em;
      white-space: pre;
      opacity: 0.75;

      &::before {
        font-weight: bold;
        content: "Diagram loading...";
      }
    }
  }
</style>
