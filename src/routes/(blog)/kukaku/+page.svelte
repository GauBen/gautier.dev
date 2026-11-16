<script lang="ts">
  import Head from "#lib/Head.svelte";
  import Header from "#lib/Header.svelte";
  import { replaceState } from "$app/navigation";
  import { onMount } from "svelte";
  import { generatePuzzle, getHint } from "./client.svelte.js";
  import { dailyOptions } from "./daily.js";
  import type { GeneratorOptions, Puzzle } from "./generator.js";
  import { Difficulty } from "./logic.js";
  import Kukaku from "./Kukaku.svelte";

  const { data } = $props();

  const SIZES = [5, 6, 7, 8];
  const GROUP_SIZES = [2, 3, 4, 5, 6];
  const DIFFICULTIES: [Difficulty, string][] = [
    [Difficulty.Easy, "Easy"],
    [Difficulty.Medium, "Medium"],
    [Difficulty.Hard, "Hard"],
  ];
  const difficultyName = (difficulty: Difficulty) =>
    DIFFICULTIES.find(([d]) => d === difficulty)![1];

  // The prerendered daily grid, replaced on mount if the day has changed
  // svelte-ignore state_referenced_locally
  let puzzle = $state<Puzzle>(data.puzzle);
  // svelte-ignore state_referenced_locally
  let today = $state(Temporal.PlainDate.from(data.date));
  let daily = $state(true);
  let loading = $state(false);

  // Settings of the next random grid
  let size = $state(5);
  let groupSize = $state(4);
  let difficulty = $state<Difficulty>(Difficulty.Medium);

  /** Result of today's grid, if already solved. */
  let dailyResult = $state<{ time: number; hints: number }>();

  let request = 0;
  /** Generates a puzzle in the worker, ignoring outdated results. */
  async function load(options: GeneratorOptions) {
    const id = ++request;
    loading = true;
    try {
      const result = await generatePuzzle(options);
      if (id === request) puzzle = result;
    } catch {
      // Cancelled by a newer request
    } finally {
      if (id === request) loading = false;
    }
  }

  const storageKey = (date: Temporal.PlainDate) => `kukaku-daily-${date}`;

  function loadDaily() {
    const date = Temporal.Now.plainDateISO();
    if (!daily || !date.equals(today)) {
      request++;
      loading = false;
      if (date.equals(Temporal.PlainDate.from(data.date))) puzzle = data.puzzle;
      else load(dailyOptions(date));
    }
    today = date;
    daily = true;
    try {
      const stored = localStorage.getItem(storageKey(today));
      dailyResult = stored === null ? undefined : JSON.parse(stored);
    } catch {
      dailyResult = undefined;
    }
    replaceState(location.pathname, {});
  }

  function newGrid() {
    const seed = Math.floor(Math.random() * 1_000_000);
    replaceState(`#${size}-${groupSize}-${difficulty}-${seed}`, {});
    daily = false;
    load({
      width: size,
      height: size,
      groupSize,
      holes: (size * size) % groupSize,
      difficulty,
      seed,
    });
  }

  function onsolve(time: number, hints: number) {
    if (!daily) return;
    dailyResult = { time, hints };
    try {
      localStorage.setItem(storageKey(today), JSON.stringify(dailyResult));
    } catch {
      // Storage unavailable: the result is simply not remembered
    }
  }

  /** Header and link of the shared result. */
  const share = () => {
    const { width, height, groupSize } = puzzle.grid;
    const level = difficultyName(puzzle.difficulty);
    const title = daily
      ? `Kukaku · ${today.toLocaleString("en-US", { month: "long", day: "numeric" })} · ${level}`
      : `Kukaku · ${width}×${height}, 1 to ${groupSize} · ${level}`;
    const url = daily ? location.origin + location.pathname : location.href;
    return { title, url };
  };

  const gethint = (groups: number[][]) =>
    getHint(puzzle.grid, puzzle.solution, groups);

  // Random puzzles are shareable as #<size>-<group size>-<difficulty>-<seed>
  onMount(() => {
    const match = /^#(\d+)-(\d+)-(\d+)-(\d+)$/.exec(location.hash);
    const [hashSize, hashGroupSize, hashDifficulty, seed] =
      match?.slice(1).map(Number) ?? [];
    if (
      SIZES.includes(hashSize) &&
      GROUP_SIZES.includes(hashGroupSize) &&
      DIFFICULTIES.some(([d]) => d === hashDifficulty)
    ) {
      daily = false;
      size = hashSize;
      groupSize = hashGroupSize;
      difficulty = hashDifficulty as Difficulty;
      load({
        width: size,
        height: size,
        groupSize,
        holes: (size * size) % groupSize,
        difficulty,
        seed,
      });
    } else {
      loadDaily();
    }
  });

  const digitList = (n: number) => {
    const digits = Array.from({ length: n }, (_, k) => k + 1);
    return `${digits.slice(0, -1).join(", ")} and ${n}`;
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
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
    Split the grid into groups of {puzzle.grid.groupSize} adjacent cells, each containing
    the digits {digitList(puzzle.grid.groupSize)} exactly once. Hatched cells are
    holes and belong to no group.
  </p>
  <p class="hint">
    Drag across cells (or click them one by one) to form a group. Stop early to
    keep a partial group, then drag from it or click next to it to extend it.
    Click a group to break it. Stuck? Ask for a hint: every grid can be solved
    by deduction alone.
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
    <label>
      Level
      <select bind:value={difficulty}>
        {#each DIFFICULTIES as [value, name] (value)}
          <option {value}>{name}</option>
        {/each}
      </select>
    </label>
    <button>New grid</button>
    <button type="button" onclick={loadDaily} disabled={daily}>
      Today's grid
    </button>
  </form>

  <h2>
    {#if daily}
      Daily grid ·
      {today.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    {:else}
      Random grid
    {/if}
    · {difficultyName(puzzle.difficulty)}
  </h2>
  {#if daily && dailyResult}
    <p class="done">
      ✓ You solved today's grid in {formatTime(
        dailyResult.time,
      )}{dailyResult.hints > 0
        ? ` with ${dailyResult.hints} hint${dailyResult.hints > 1 ? "s" : ""}`
        : ""}.
    </p>
  {/if}

  <div class="play" class:loading aria-busy={loading}>
    {#key puzzle}
      <Kukaku grid={puzzle.grid} {onsolve} {gethint} {share} />
    {/key}
    {#if loading}
      <p class="spinner">Generating…</p>
    {/if}
  </div>
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

    button:disabled {
      cursor: default;
      opacity: 0.4;
    }
  }

  h2 {
    margin-block: 1.5rem 0.5rem;
    font-size: 1.25em;
    text-align: center;
  }

  .done {
    margin-top: 0;
    color: #3b8a4f;
    text-align: center;
  }

  .hint {
    font-size: 0.875em;
    color: #555;
  }

  .play {
    position: relative;
  }

  .loading > :global(.kukaku) {
    pointer-events: none;
    opacity: 0.3;
    transition: opacity 200ms 200ms;
  }

  .spinner {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    margin: 0;
    font-weight: 500;
  }
</style>
