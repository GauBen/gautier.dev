<script lang="ts">
  const measure = async () =>
    new Promise<Record<string, number>>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (entry.name.includes("/search.")) resolve(entry as never);
      });
      observer.observe({ entryTypes: ["resource"] });
      import("../../routes/(blog)/search.js").then(() => observer.disconnect());
    });

  const format = (n: number) => Number(n.toPrecision(2));
</script>

<p>
  {#await measure()}
    Loading search index...
  {:then { duration, decodedBodySize, encodedBodySize }}
    It took <strong>{format(duration)}ms</strong> to load the
    <strong>{format(decodedBodySize / 1024)}kB</strong> search index (<strong
      >{format(encodedBodySize / 1024)}kB</strong
    > transferred).
  {:catch error}
    {error.message}
  {/await}
</p>
