<script>
  import Mermaid from "$lib/Mermaid.svelte";
</script>

<main style="text-align: center">
  <h1>Yak Shaving Map</h1>

  <!-- prettier-ignore -->
  <Mermaid>
    graph TD
      timeline((Timeline)) --> formgator((Formgator))
      timeline --> uistiti((Uistiti))
  </Mermaid>
</main>
