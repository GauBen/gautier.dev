<script lang="ts">
  const measure = async () => {
    const matches = String(() => import("$lib/search.js")).match(
      /import\((["']).+?\1\)/,
    );
    if (!matches) throw new Error("No import found");
    const url = matches[0].slice(8, -2);
    const start = performance.now();
    const response = await fetch(new URL(url, import.meta.url));
    const { size } = await response.blob();
    const duration = performance.now() - start;
    return { duration, size };
  };

  const format = (n: number) => Number(n.toPrecision(2));
</script>

<p>
  {#await measure()}
    Loading search engine and index...
  {:then { duration, size }}
    It took <strong>{format(duration)}ms</strong> to download the
    <strong>{format(size / 1024)}kB</strong>
    search engine and index.
  {:catch error}
    {error.message}
  {/await}
</p>
