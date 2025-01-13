<script lang="ts">
  import { Table } from "$lib/markdown";

  const { weightedKeywords, metadata }: typeof import("$lib/search.js") =
    $props();

  const keywords = $derived(
    [...weightedKeywords].map(([keyword, articles], index) => ({
      index,
      keyword,
      articles,
      highest: articles[0].score,
      sum: articles.reduce((acc, { score }) => acc + score, 0),
      matches: articles.length,
    })),
  );

  let value = $state("");
  let pageNumber = $state(0);
  let orderBy = $state<"sum" | "highest" | "matches">("sum");
  const pageLength = 25;

  const sorted = $derived(
    keywords
      .filter(({ keyword }) => keyword.startsWith(value))
      .sort((a, b) => b[orderBy] - a[orderBy]),
  );
  const page = $derived(
    sorted.slice(pageNumber * pageLength, (pageNumber + 1) * pageLength),
  );

  $effect(() => {
    // Bring to the first page when value changes
    void value;
    pageNumber = 0;
  });
</script>

<form>
  <p>
    <strong>{keywords.length} keywords</strong> extracted from
    {Object.keys(metadata).length} articles.
  </p>

  <p class="row" style="justify-content: space-between">
    <label class="row">
      Search the index:
      <input type="search" bind:value />
    </label>
    <label class="row">
      Order by:
      <select bind:value={orderBy}>
        <option value="sum">Highest total score</option>
        <option value="highest">Highest individual score</option>
        <option value="matches">Number of matches</option>
      </select>
    </label>
  </p>

  <header>
    <span></span>
    <span></span>
    <span style="text-align: start">Keyword</span>
    <span style:font-weight={orderBy == "matches" ? "bold" : "inherit"}
      >Matches</span
    >
    <span style:font-weight={orderBy == "highest" ? "bold" : "inherit"}>
      Highest</span
    >
    <span style:font-weight={orderBy == "sum" ? "bold" : "inherit"}>Sum</span>
  </header>
  {#each page as { index, keyword, matches, highest, sum, articles } (keyword)}
    <details>
      <summary>
        <span>#{index + 1}</span>
        <strong>{keyword}</strong>
        <span>{matches}</span>
        <span>{highest}</span>
        <span>{sum}</span>
      </summary>
      <Table style="padding: 0 0 .5em">
        {#each articles as { slug, score }}
          <tr>
            <td>
              <a href="/articles/{slug}">
                {metadata[slug].title}
              </a>
            </td>
            <td style="text-align: right">
              <em>
                {score}
              </em>
            </td>
          </tr>
        {/each}
      </Table>
    </details>
  {:else}
    <div style="text-align: center"><em>0 matches</em></div>
  {/each}

  {#if sorted.length > pageLength}
    <p class="row" style="justify-content: center">
      <button
        type="button"
        disabled={pageNumber === 0}
        onclick={() => (pageNumber -= 1)}
      >
        Previous
      </button>
      <label class="row">
        Page:
        <select bind:value={pageNumber}>
          {#each Array.from({ length: Math.ceil(sorted.length / pageLength) }, (_, i) => i) as i}
            <option value={i}>{i + 1}</option>
          {/each}
        </select>
        / {Math.ceil(sorted.length / pageLength)}
      </label>
      <button
        type="button"
        disabled={pageNumber === Math.floor(sorted.length / pageLength)}
        onclick={() => (pageNumber += 1)}
      >
        Next
      </button>
    </p>
  {/if}
</form>

<style lang="scss">
  summary {
    cursor: pointer;
  }

  summary,
  header {
    display: grid;
    grid-template-columns: 1em 3em 1fr auto 3em 3em;
    gap: 0.5em;
    padding: 0.25em;

    span {
      text-align: end;
    }
  }

  summary::before {
    content: "➕";
  }

  details[open] summary::before {
    content: "➖";
  }

  summary:hover,
  tr:hover {
    background: #8882;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    align-items: center;
  }
</style>
