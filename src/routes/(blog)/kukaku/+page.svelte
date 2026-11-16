<script lang="ts">
  import Head from "#lib/Head.svelte";
  import Header from "#lib/Header.svelte";
  import { onMount } from "svelte";
  import { generate } from "./generator.js";
  import { parseGrid, type Grid } from "./grid.js";
  import Kukaku from "./Kukaku.svelte";

  const SIZES = [5, 6, 7, 8];
  const GROUP_SIZES = [2, 3, 4, 5, 6];

  let grid = $state<Grid>(
    parseGrid(`
      2 2 4 1 4
      4 3 1 3 3
      1 4 2 3 1
      3 1 3 # 2
      4 2 4 1 2
    `),
  );
  let size = $state(5);
  let groupSize = $state(4);

  /** Generates a puzzle, with as few holes as possible. */
  function load(newSize: number, newGroupSize: number, seed: number) {
    size = newSize;
    groupSize = newGroupSize;
    const holes = (size * size) % groupSize;
    grid = generate({
      width: size,
      height: size,
      groupSize,
      holes,
      seed,
    }).grid;
  }

  function newGrid() {
    const seed = Math.floor(Math.random() * 1_000_000);
    history.replaceState(history.state, "", `#${size}-${groupSize}-${seed}`);
    load(size, groupSize, seed);
  }

  // Puzzles are shareable as #<size>-<group size>-<seed>
  onMount(() => {
    const match = /^#(\d+)-(\d+)-(\d+)$/.exec(location.hash);
    if (!match) return;
    const [newSize, newGroupSize, seed] = match.slice(1).map(Number);
    if (SIZES.includes(newSize) && GROUP_SIZES.includes(newGroupSize))
      load(newSize, newGroupSize, seed);
  });

  const digitList = (n: number) => {
    const digits = Array.from({ length: n }, (_, k) => k + 1);
    return `${digits.slice(0, -1).join(", ")} and ${n}`;
  };
</script>

<Head
  title="Kukaku"
  description="A logic puzzle: split the grid into groups of adjacent cells holding 1, 2, 3 and 4."
/>

<Header />

<main>
  <h1>Kukaku</h1>

  <p>
    Split the grid into groups of {grid.groupSize} adjacent cells, each containing
    the digits {digitList(grid.groupSize)} exactly once. Hatched cells are holes and
    belong to no group.
  </p>
  <p class="hint">
    Click or drag across cells to form a group. Click a group to break it.
  </p>

  <form
    class="new"
    onsubmit={(event) => {
      event.preventDefault();
      newGrid();
    }}
  >
    <label>
      Size
      <select bind:value={size}>
        {#each SIZES as n (n)}
          <option value={n}>{n}×{n}</option>
        {/each}
      </select>
    </label>
    <label>
      Digits
      <select bind:value={groupSize}>
        {#each GROUP_SIZES as n (n)}
          <option value={n}>1 to {n}</option>
        {/each}
      </select>
    </label>
    <button>New grid</button>
  </form>

  {#key grid}
    <Kukaku {grid} />
  {/key}
</main>

<style>
  main {
    padding: 0 0.5em;
    margin: 0 auto;
    contain: paint;

    > :global(*) {
      max-width: var(--main-width);
      margin-inline: auto;
    }
  }

  h1 {
    margin: 2rem auto 1rem;
  }

  .new {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: center;
    margin-block: 1rem;

    select,
    button {
      padding: 0.25em 0.75em;
      font: inherit;
      color: inherit;
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #0003;
      border-radius: 0.25rem;
    }
  }

  .hint {
    font-size: 0.875em;
    color: #555;
  }
</style>
