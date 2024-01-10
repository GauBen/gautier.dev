<script lang="ts">
  // Hacky stuff to get the URL of the search index
  const measure = async () => {
    const currentModule = await fetch(import.meta.url).then((r) => r.text());
    const searchIndexModule = currentModule.match(
      /import\("(.+?search\..+?)"\)/,
    )?.[1];

    if (!searchIndexModule) {
      await import("../../routes/(blog)/search.js");
      throw new Error("Could not find the search index module");
    }

    const start = performance.now();
    const response = await fetch(new URL(searchIndexModule, import.meta.url));

    return {
      time: performance.now() - start,
      size: Number(response.headers.get("content-length")),
    };
  };
</script>

<p>
  {#await measure()}
    Loading search index...
  {:then { time, size }}
    It took <strong>{Number(time.toPrecision(2))}ms</strong> to load the
    <strong>{Number((size / 1024).toPrecision(2))}kB</strong> search index.
  {:catch error}
    {error.message}
  {/await}
</p>
