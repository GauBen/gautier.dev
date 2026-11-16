<script lang="ts">
  import { deadCells, isConnected, neighbors, type Grid } from "./grid.js";

  interface Group {
    cells: number[];
    /** Index in the color palette, stable while the group exists. */
    color: number;
  }

  const { grid }: { grid: Grid } = $props();

  const PALETTE = 8;
  const playable = $derived(grid.cells.filter((c) => c !== null).length);

  let groups = $state<Group[]>([]);
  let past = $state<Group[][]>([]);
  let future = $state<Group[][]>([]);
  let selection = $state<number[]>([]);
  let focused = $state(0);

  /** Cell index → index in `groups`, or -1. */
  const owner = $derived.by(() => {
    const owner = Array.from(grid.cells, () => -1);
    groups.forEach((group, g) => {
      for (const i of group.cells) owner[i] = g;
    });
    return owner;
  });
  const dead = $derived(
    deadCells(grid, new Set(groups.flatMap((group) => group.cells))),
  );
  const solved = $derived(groups.length * grid.groupSize === playable);

  // Timer: starts on the first interaction, stops when solved
  let startedAt = $state<number>();
  let endedAt = $state<number>();
  let now = $state(Date.now());
  $effect(() => {
    if (startedAt === undefined || endedAt !== undefined) return;
    const interval = setInterval(() => (now = Date.now()), 250);
    return () => clearInterval(interval);
  });
  $effect(() => {
    if (solved && startedAt !== undefined) endedAt ??= Date.now();
  });
  const elapsed = $derived(
    startedAt === undefined ? 0 : (endedAt ?? now) - startedAt,
  );
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  function commit(next: Group[]) {
    past.push(groups);
    future = [];
    groups = next;
  }

  function undo() {
    const previous = past.pop();
    if (!previous) return;
    future.push(groups);
    groups = previous;
    selection = [];
  }

  function redo() {
    const next = future.pop();
    if (!next) return;
    past.push(groups);
    groups = next;
    selection = [];
  }

  function reset() {
    if (groups.length > 0) commit([]);
    selection = [];
  }

  /**
   * Handles a click (or a drag entering a cell) on cell `i`. Clicking a group
   * removes it; clicking free cells builds a selection that becomes a group
   * once it holds every digit from 1 to `grid.groupSize`.
   */
  function pick(i: number, dragging: boolean) {
    const digit = grid.cells[i];
    if (digit === null || solved) return;
    if (startedAt === undefined) startedAt = now = Date.now();

    const g = owner[i];
    if (g >= 0) {
      if (!dragging) {
        commit(groups.toSpliced(g, 1));
        selection = [];
      }
      return;
    }

    if (selection.includes(i)) {
      if (dragging) {
        // Dragging back over the previous cell undoes the last step
        if (selection.at(-2) === i) selection.pop();
      } else {
        const rest = selection.filter((j) => j !== i);
        selection = isConnected(grid, rest) ? rest : [];
      }
      return;
    }

    const extends_ =
      selection.length > 0 &&
      selection.every((j) => grid.cells[j] !== digit) &&
      neighbors(grid, i).some((j) => selection.includes(j));

    if (extends_) selection.push(i);
    else if (!dragging || selection.length === 0) selection = [i];
    else return;

    if (selection.length === grid.groupSize) {
      // Pick a color unused by adjacent groups, preferring the least used one
      const adjacent = new Set(
        selection.flatMap((i) =>
          neighbors(grid, i)
            .filter((j) => owner[j] >= 0)
            .map((j) => groups[owner[j]].color),
        ),
      );
      const usage = (c: number) =>
        groups.filter((group) => group.color === c).length;
      const all = Array.from({ length: PALETTE }, (_, c) => c);
      const free = all.filter((c) => !adjacent.has(c));
      const color = (free.length > 0 ? free : all).reduce((best, c) =>
        usage(c) < usage(best) ? c : best,
      );
      commit([...groups, { cells: selection, color }]);
      selection = [];
    }
  }

  // Pointer interactions: click, or press and drag across cells
  let dragging = false;
  let last = -1;
  const cellAt = (x: number, y: number) => {
    const el = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>("[data-i]");
    return el ? Number(el.dataset.i) : -1;
  };

  function onpointerdown(event: PointerEvent) {
    if (event.button !== 0) return;
    const i = cellAt(event.clientX, event.clientY);
    if (i < 0) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragging = true;
    last = i;
    focused = i;
    pick(i, false);
  }

  function onpointermove(event: PointerEvent) {
    if (!dragging) return;
    const i = cellAt(event.clientX, event.clientY);
    if (i < 0 || i === last) return;
    last = i;
    focused = i;
    pick(i, true);
  }

  function onpointerup() {
    dragging = false;
    last = -1;
  }

  // Keyboard interactions: arrows to move, Enter/Space to pick
  let cellElements = $state<HTMLButtonElement[]>([]);

  function onkeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key === "Escape") {
      selection = [];
      return;
    }

    const row = Math.floor(focused / grid.width);
    const col = focused % grid.width;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [row - 1, col],
      ArrowDown: [row + 1, col],
      ArrowLeft: [row, col - 1],
      ArrowRight: [row, col + 1],
    };
    const target = moves[event.key];
    if (!target) return;
    event.preventDefault();
    const [r, c] = target;
    if (r < 0 || r >= grid.height || c < 0 || c >= grid.width) return;
    focused = r * grid.width + c;
    cellElements[focused]?.focus();
  }

  /** Inset shadows drawing the outline of the region `i` belongs to. */
  function outline(i: number, inRegion: (j: number) => boolean, width: string) {
    const row = Math.floor(i / grid.width);
    const col = i % grid.width;
    const sides: [boolean, string][] = [
      [row === 0 || !inRegion(i - grid.width), `0 ${width}`],
      [col === grid.width - 1 || !inRegion(i + 1), `-${width} 0`],
      [row === grid.height - 1 || !inRegion(i + grid.width), `0 -${width}`],
      [col === 0 || !inRegion(i - 1), `${width} 0`],
    ];
    return sides
      .filter(([edge]) => edge)
      .map(([, offset]) => `inset ${offset} 0 0 var(--edge)`)
      .join(", ");
  }

  /**
   * Corner squares filling the gap at inner elbows of a region: both orthogonal
   * neighbors of a corner are in the region, the diagonal is not. Returned as
   * `background-image` and `background-position` lists.
   */
  function elbows(i: number, inRegion: (j: number) => boolean) {
    const row = Math.floor(i / grid.width);
    const col = i % grid.width;
    const has = (r: number, c: number) =>
      r >= 0 &&
      r < grid.height &&
      c >= 0 &&
      c < grid.width &&
      inRegion(r * grid.width + c);

    const positions: string[] = [];
    for (const [dr, dc, position] of [
      [-1, -1, "top left"],
      [-1, 1, "top right"],
      [1, 1, "bottom right"],
      [1, -1, "bottom left"],
    ] as const) {
      if (has(row + dr, col) && has(row, col + dc) && !has(row + dr, col + dc))
        positions.push(position);
    }
    if (positions.length === 0)
      return { image: undefined, position: undefined };
    return {
      image: positions.map(() => "linear-gradient(var(--edge) 0 0)").join(", "),
      position: positions.join(", "),
    };
  }

  function describe(i: number) {
    const row = Math.floor(i / grid.width) + 1;
    const col = (i % grid.width) + 1;
    const digit = grid.cells[i];
    if (digit === null) return `Row ${row}, column ${col}: hole`;
    const state =
      owner[i] >= 0
        ? `in group ${owner[i] + 1}`
        : selection.includes(i)
          ? "selected"
          : dead.has(i)
            ? "free, cannot be completed"
            : "free";
    return `Row ${row}, column ${col}: ${digit}, ${state}`;
  }
</script>

<div class="kukaku" style:--w={grid.width}>
  <div class="toolbar">
    <span class="timer" aria-label="Elapsed time">{formatTime(elapsed)}</span>
    <span class="progress"
      >{groups.length}/{playable / grid.groupSize} groups</span
    >
    <span class="actions">
      <button type="button" onclick={undo} disabled={past.length === 0}>
        Undo
      </button>
      <button type="button" onclick={redo} disabled={future.length === 0}>
        Redo
      </button>
      <button type="button" onclick={reset} disabled={groups.length === 0}>
        Reset
      </button>
    </span>
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="grid"
    class:solved
    role="grid"
    aria-label="Kukaku grid"
    tabindex="-1"
    {onpointerdown}
    {onpointermove}
    {onpointerup}
    onpointercancel={onpointerup}
    {onkeydown}
  >
    {#each { length: grid.height }, row (row)}
      <div role="row" class="row">
        {#each { length: grid.width }, col (col)}
          {@const i = row * grid.width + col}
          {@const digit = grid.cells[i]}
          {@const g = owner[i]}
          {@const selected = selection.includes(i)}
          {@const inRegion =
            g >= 0
              ? (j: number) => owner[j] === g
              : selected
                ? (j: number) => selection.includes(j)
                : undefined}
          {@const edgeWidth = selected ? "0.15em" : "0.2em"}
          {@const corners = inRegion && elbows(i, inRegion)}
          <button
            type="button"
            role="gridcell"
            class="cell"
            class:hole={digit === null}
            class:grouped={g >= 0}
            class:selected
            class:dead={dead.has(i) && !selected}
            data-i={i}
            data-color={g >= 0 ? groups[g].color : undefined}
            tabindex={i === focused ? 0 : -1}
            aria-label={describe(i)}
            aria-selected={selected}
            disabled={digit === null}
            style:box-shadow={inRegion && outline(i, inRegion, edgeWidth)}
            style:background-size={corners?.image &&
              `${edgeWidth} ${edgeWidth}`}
            style:background-image={corners?.image}
            style:background-position={corners?.position}
            onfocus={() => (focused = i)}
            onclick={(event) => {
              // Pointer clicks are handled on pointerdown; this is for keyboards
              if (event.detail === 0) pick(i, false);
            }}
          >
            {digit ?? ""}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  <p class="status" aria-live="polite">
    {#if solved}
      🎉 Solved in {formatTime(elapsed)}!
    {:else if dead.size > 0}
      Some cells can no longer be grouped.
    {:else}
      &nbsp;
    {/if}
  </p>
</div>

<style>
  .kukaku {
    --line: #0002;
    --cell: #fff;
    --selected: #fff6b3;

    max-width: calc(var(--w, 5) * 4.5rem);
    margin-inline: auto;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .timer {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .progress {
    color: #555;
  }

  .actions {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
  }

  .actions button {
    padding: 0.25em 0.75em;
    font: inherit;
    color: inherit;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #0003;
    border-radius: 0.25rem;

    &:hover:not(:disabled) {
      background-color: #f2f2f8;
    }

    &:disabled {
      cursor: default;
      opacity: 0.4;
    }
  }

  .grid {
    display: grid;
    container-type: inline-size;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    outline: none;
    border: 1px solid var(--line);
    border-radius: 0.375rem;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(var(--w), 1fr);
  }

  .solved {
    --cursor: default;
  }

  .cell {
    --edge: transparent;

    position: relative;
    aspect-ratio: 1;
    padding: 0;
    font:
      500 calc(50cqi / var(--w)) / 1 "Techna Sans",
      sans-serif;
    color: #222;
    cursor: var(--cursor, pointer);
    background-color: var(--cell);
    background-repeat: no-repeat;
    border: 0;
    transition: background-color 100ms;

    &::after {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: "";
    }

    &:focus-visible {
      position: relative;
      z-index: 1;
      outline: 0.15em solid var(--link);
      outline-offset: -0.15em;
    }

    &:hover:not(.grouped, .selected, .hole) {
      background-color: #f2f2f8;
    }
  }

  /* Thin cell separators, drawn over the cells so group outlines stay unbroken */
  .cell:not(:last-child)::after {
    border-right: 1px solid var(--line);
  }

  .row:not(:last-child) .cell::after {
    border-bottom: 1px solid var(--line);
  }

  .hole {
    cursor: default;
    background: repeating-linear-gradient(
      -45deg,
      #ddd 0 0.25em,
      #eee 0.25em 0.5em
    );
  }

  .selected {
    --edge: #b39800;

    background-color: var(--selected);
  }

  .dead {
    color: #c0392b;
    background-color: #fdecea;
  }

  .grouped {
    &[data-color="0"] {
      --edge: #2f6fb3;

      background-color: #dbe9f8;
    }

    &[data-color="1"] {
      --edge: #c0602a;

      background-color: #fbe3d4;
    }

    &[data-color="2"] {
      --edge: #3b8a4f;

      background-color: #dcf0df;
    }

    &[data-color="3"] {
      --edge: #8a4fb3;

      background-color: #ece0f6;
    }

    &[data-color="4"] {
      --edge: #b3366a;

      background-color: #f8dbe7;
    }

    &[data-color="5"] {
      --edge: #2c8c8c;

      background-color: #d6f0ef;
    }

    &[data-color="6"] {
      --edge: #8a7a2a;

      background-color: #f2edcf;
    }

    &[data-color="7"] {
      --edge: #5a5a75;

      background-color: #e3e3ec;
    }
  }

  .status {
    min-height: 1.5em;
    margin-top: 0.75rem;
    text-align: center;
  }

  .solved + .status {
    font-weight: 500;
  }
</style>
