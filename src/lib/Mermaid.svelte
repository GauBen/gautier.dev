<script lang="ts">
  import mermaid from "mermaid";
  import type { Snippet } from "svelte";
  import type { Action } from "svelte/action";

  const { children } = $props<{ children: Snippet }>();

  const mermaidify: Action = (node) => {
    // Remove SSR landmarks
    node.innerHTML = node.textContent!;
    void mermaid.run({ nodes: [node] });
  };
</script>

<div use:mermaidify>{@render children()}</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;

    // Mermaid sets data-processed=true when the diagram is ready
    &:not([data-processed]) {
      padding: 0.5em;
      white-space: pre;
      opacity: 0.5;

      &::before {
        font-weight: bold;
        content: "Diagram loading...";
      }
    }
  }
</style>
