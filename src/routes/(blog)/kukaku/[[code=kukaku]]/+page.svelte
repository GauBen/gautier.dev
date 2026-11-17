<script lang="ts">
  import Head from "#lib/Head.svelte";
  import Header from "#lib/Header.svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { navigating, page } from "$app/state";
  import CheckCircle from "@iconify-svelte/ph/check-circle-duotone";
  import { onMount } from "svelte";
  import { getHint } from "../client.svelte.js";
  import {
    available,
    DIFFICULTIES,
    GROUP_SIZES,
    randomCode,
    SIZES,
  } from "../code.js";
  import { formatHints, formatTime } from "../format.js";
  import Glyph, { glyphName } from "../Glyph.svelte";
  import Kukaku from "../Kukaku.svelte";
  import { Difficulty } from "../logic.js";

  const { data } = $props();
  const { grid } = $derived(data.puzzle);
  const level = $derived(
    DIFFICULTIES.find(([d]) => d === data.puzzle.difficulty)![1],
  );
  const date = (options: Intl.DateTimeFormatOptions) =>
    data.date?.toLocaleString("en-US", options);

  // Settings of the next random grid, those of the current one by default
  let size = $derived(data.options.width);
  let groupSize = $derived(data.options.groupSize);
  let difficulty = $derived(data.options.difficulty ?? Difficulty.Medium);

  /** Whether another grid is being generated (see `+page.ts`). */
  const loading = $derived(navigating.to !== null);

  // Storage may be unavailable: nothing is remembered then
  const save = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  const stored = (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null") ?? undefined;
    } catch {}
  };

  /** Symbols instead of digits, remembered across visits. */
  let symbols = $state(false);
  const SYMBOLS_KEY = "kukaku-symbols";
  onMount(() => {
    symbols = stored(SYMBOLS_KEY) === true;
  });

  /** Result of the daily grid, if already solved. */
  const resultKey = $derived(data.date && `kukaku-daily-${data.date}`);
  let dailyResult = $derived<{ time: number; hints: number } | undefined>(
    resultKey && stored(resultKey),
  );
  function onsolve(time: number, hints: number) {
    if (!resultKey) return;
    dailyResult = { time, hints };
    save(resultKey, dailyResult);
  }

  /** Header and link of the shared result. */
  const share = () => ({
    title: data.date
      ? `Kukaku · ${date({ month: "long", day: "numeric" })} · ${level}`
      : `Kukaku · ${grid.width}×${grid.height}, 1 to ${grid.groupSize} · ${level}`,
    url: page.url.href,
  });

  const gethint = (groups: number[][]) =>
    getHint(grid, data.puzzle.solution, groups);

  const range = (n: number) => Array.from({ length: n }, (_, k) => k + 1);
</script>

<Head
  title="Kukaku"
  description="A logic puzzle: split the grid into groups of adjacent cells holding 1, 2, 3 and 4."
/>

<Header />

<main>
  <h1>Kukaku</h1>
  <p class="definition">
    <span lang="ja">区画</span> · <i>noun</i> — a parcel of land, marked out from
    a larger whole.
  </p>

  <p>
    Split the grid into groups of {grid.groupSize} adjacent cells, each containing
    {symbols ? "the symbols" : "the digits"}
    {#each range(grid.groupSize) as digit, k (digit)}{k === 0
        ? ""
        : k === grid.groupSize - 1
          ? " and "
          : ", "}{#if symbols}<span class="symbol"
          ><Glyph {digit} /> {glyphName(digit)}</span
        >{:else}{digit}{/if}{/each}
    exactly once. Hatched cells are holes and belong to no group.
  </p>
  <p class="hint">
    Drag across cells (or click them one by one) to form a group. Stop early to
    keep a partial group, then drag from it or click next to it to extend it.
    Click a group to break it. With a keyboard, move with the arrow keys and
    press Enter or Space instead of clicking. Stuck? Ask for a hint: every grid
    can be solved by deduction alone.
  </p>

  <!-- Navigations between grids keep the scroll and focus -->
  <form
    class="new"
    aria-label="Grid settings"
    data-sveltekit-reset="false"
    onsubmit={(event) => {
      event.preventDefault();
      const code = randomCode(size, groupSize, difficulty);
      goto(resolve("/(blog)/kukaku/[[code=kukaku]]", { code }), {
        reset: false,
      });
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
      <select
        bind:value={groupSize}
        onchange={() => {
          if (!available(groupSize, difficulty)) difficulty = Difficulty.Easy;
        }}
      >
        {#each GROUP_SIZES as n (n)}
          <option value={n}>1 to {n}</option>
        {/each}
      </select>
    </label>
    <label>
      Level
      <select bind:value={difficulty}>
        {#each DIFFICULTIES as [value, name] (value)}
          <option {value} disabled={!available(groupSize, value)}>{name}</option
          >
        {/each}
      </select>
    </label>
    <button>New grid</button>
    <a
      href={resolve("/(blog)/kukaku/[[code=kukaku]]", { code: undefined })}
      aria-disabled={data.date?.equals(data.today)}
    >
      Today's grid
    </a>
    <label class="switch">
      <input
        type="checkbox"
        role="switch"
        bind:checked={symbols}
        onchange={() => save(SYMBOLS_KEY, symbols)}
      />
      Symbols
    </label>
  </form>

  <h2>
    {#if data.date}
      Daily grid · {date({ weekday: "long", month: "long", day: "numeric" })}
    {:else}
      Random grid
    {/if}
    · {level}
  </h2>
  {#if dailyResult}
    <p class="done">
      <CheckCircle aria-hidden="true" /> You solved this grid in {formatTime(
        dailyResult.time,
      )}{dailyResult.hints > 0
        ? ` with ${formatHints(dailyResult.hints)}`
        : ""}.
    </p>
  {/if}

  <div class="play" class:loading>
    <div class="board" inert={loading}>
      {#key data.puzzle}
        <Kukaku {grid} {symbols} {onsolve} {gethint} {share} />
      {/key}
    </div>
    {#if loading}
      <p class="spinner" aria-hidden="true">Generating…</p>
    {/if}
    <p class="sr-only" role="status">
      {loading ? "Generating a new grid…" : ""}
    </p>
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
    margin: 2rem auto 0;
  }

  .definition {
    margin-block: 0.25rem 1.5rem;
    font-size: 0.875em;
    color: #777;
  }

  .new {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: center;
    margin-block: 1rem;

    label {
      display: flex;
      gap: 0.5em;
      align-items: center;
    }

    /* Same explicit height: selects ignore `line-height` */
    select,
    button,
    a {
      block-size: 2em;
      padding: 0 0.75em;
      font: inherit;
      color: inherit;
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #0007; /* 3:1 against the background */
      border-radius: 0.25rem;
    }

    a {
      display: inline-flex;
      align-items: center;
      background-image: none; /* No link underline */
    }

    [aria-disabled="true"] {
      pointer-events: none;
      opacity: 0.4;
    }
  }

  .switch input {
    margin: 0;
    accent-color: var(--link);
  }

  h2 {
    margin-block: 1.5rem 0.5rem;
    font-size: 1.25em;
    text-align: center;
  }

  .done {
    margin-top: 0;
    color: #2f7a42;
    text-align: center;

    :global(svg) {
      width: 1.25em;
      height: 1.25em;
      vertical-align: -0.25em;
    }
  }

  .hint {
    font-size: 0.875em;
    color: #555;
  }

  .play {
    position: relative;
  }

  .loading > .board {
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

  .symbol {
    white-space: nowrap;
  }
</style>
