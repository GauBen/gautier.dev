<script lang="ts">
  import Card from "$lib/Card.svelte";
</script>

{#each [{ slug: "a", title: "A" }, { slug: "b", title: "B" }] as { slug, title }}
  <Card>
    <h2>
      <a href="/articles/{slug}">{title}</a>
    </h2>
  </Card>
{/each}
