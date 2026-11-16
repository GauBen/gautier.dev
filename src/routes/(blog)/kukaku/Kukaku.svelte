<script lang="ts">
  import { deadCells, isConnected, neighbors, type Grid } from "./grid.js";
  import { Rule, type Hint } from "./logic.js";

  interface Group {
    cells: number[];
    /** Index in the color palette, stable while the group exists. */
    color: number;
  }

  const {
    grid,
    onsolve,
    gethint,
    share,
  }: {
    grid: Grid;
    /**
     * Called once when the grid is solved, with the time taken in ms and the
     * number of hints used.
     */
    onsolve?: (time: number, hints: number) => void;
    /** Computes a hint for the current groups (complete or partial). */
    gethint?: (groups: number[][]) => Promise<Hint>;
    /** First line and link of the result shared once solved. */
    share?: () => { title: string; url: string };
  } = $props();

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
  const complete = $derived(
    groups.filter((group) => group.cells.length === grid.groupSize),
  );
  const dead = $derived(
    deadCells(grid, new Set(complete.flatMap((group) => group.cells))),
  );
  const solved = $derived(complete.length * grid.groupSize === playable);

  // Timer: starts on the first interaction, stops when solved
  let startedAt = $state<number>();
  let endedAt = $state<number>();
  let now = $state(Date.now());
  $effect(() => {
    if (startedAt === undefined || endedAt !== undefined) return;
    const interval = setInterval(() => (now = Date.now()), 250);
    return () => clearInterval(interval);
  });
  const elapsed = $derived(
    startedAt === undefined ? 0 : (endedAt ?? now) - startedAt,
  );
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  // Hints: computed by `gethint`, shown until the next move
  let computedHint = $state.raw<{ hint: Hint; groups: Group[] }>();
  let hintLoading = $state(false);
  let hintsUsed = $state(0);
  /** The hint, as long as the player has not moved since asking for it. */
  const hint = $derived(
    computedHint?.groups === groups && selection.length === 0
      ? computedHint.hint
      : undefined,
  );
  const hinted = $derived(
    new Set(hint && hint.kind !== "none" ? hint.cells : []),
  );

  async function askHint() {
    if (!gethint || solved || hintLoading) return;
    if (startedAt === undefined) startedAt = now = Date.now();
    cancel();
    hintLoading = true;
    try {
      const asked = groups;
      const result = await gethint(asked.map((group) => group.cells));
      computedHint = { hint: result, groups: asked };
      if (result.kind !== "none") hintsUsed++;
    } finally {
      hintLoading = false;
    }
  }

  const ruleExplanation = (rule: Rule) =>
    rule === Rule.Region
      ? " Otherwise, a region would be left that cannot be completed."
      : rule === Rule.Lookahead
        ? " Otherwise, a cell would be left with no possible group."
        : "";

  // Sharing the result: time, hints and groups drawn with colored squares
  const SQUARES = ["🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫"];
  /** Square matching each palette color (none for teal). */
  const PREFERRED = ["🟦", "🟧", "🟩", "🟪", "🟥", "🟩", "🟨", "🟫"];

  function shareText() {
    const { title, url } = share?.() ?? {
      title: "Kukaku",
      url: location.href,
    };
    // Color groups like on screen, unless two adjacent groups would get the
    // same square: there is no teal square, so teal groups (palette color 5)
    // pick theirs last, among the squares unused by their neighbors
    const squares: string[] = [];
    const order = groups
      .map((_, g) => g)
      .sort((a, b) => +(groups[a].color === 5) - +(groups[b].color === 5));
    for (const g of order) {
      const taken = new Set(
        groups[g].cells.flatMap((i) =>
          neighbors(grid, i)
            .map((j) => owner[j])
            .filter((h) => h >= 0 && h !== g)
            .map((h) => squares[h]),
        ),
      );
      const preferred = PREFERRED[groups[g].color];
      squares[g] = taken.has(preferred)
        ? (SQUARES.find((square) => !taken.has(square)) ?? preferred)
        : preferred;
    }

    const rows: string[] = [];
    for (let row = 0; row < grid.height; row++) {
      let line = "";
      for (let col = 0; col < grid.width; col++) {
        const g = owner[row * grid.width + col];
        line += g >= 0 ? squares[g] : "⬜";
      }
      rows.push(line);
    }

    const hints =
      hintsUsed > 0 ? ` · 💡 ${hintsUsed} hint${hintsUsed > 1 ? "s" : ""}` : "";
    return [
      title,
      `⏱️ ${formatTime(elapsed)}${hints}`,
      "",
      ...rows,
      "",
      url,
    ].join("\n");
  }

  let copied = $state<"yes" | "no">();
  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText());
      copied = "yes";
    } catch {
      copied = "no";
    }
    setTimeout(() => (copied = undefined), 2000);
  }

  // Victory animation: a wave spreading from the last cell placed, then
  // fireworks drawn in pixel art, each cell being a pixel of a night sky
  let lastCell = $state(0);
  let night = $state(false);
  /** Light of each cell during the fireworks. */
  let sky = $state.raw<({ color: string; a: number } | undefined)[]>([]);
  let stopFireworks: (() => void) | undefined;

  const SPARK_COLORS = [
    "#ff5964",
    "#ffd23f",
    "#3bceac",
    "#5aa9e6",
    "#c77dff",
    "#ff9f1c",
  ];
  const ROCKET_COLOR = "#fff3c4";
  const FRAME = 75;

  function fireworks() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { width, height } = grid;
    const light = new Float32Array(width * height);
    const colors = Array.from({ length: width * height }, () => ROCKET_COLOR);
    const lit = (x: number, y: number, color: string, a: number) => {
      const [col, row] = [Math.round(x), Math.round(y)];
      if (col < 0 || col >= width || row < 0 || row >= height) return;
      const i = row * width + col;
      if (a < light[i]) return;
      light[i] = a;
      colors[i] = color;
    };

    const pick = <T,>(items: T[]) =>
      items[Math.floor(Math.random() * items.length)];
    const rockets = Array.from({ length: 4 }, (_, k) => ({
      // Away from the edges, so that the explosion stays in the grid
      x: 1 + Math.floor(Math.random() * Math.max(1, width - 2)),
      y: height,
      top: 1 + Math.floor(Math.random() * Math.max(1, height / 2 - 1)),
      color: pick(SPARK_COLORS),
      start: 6 + k * 9,
      exploded: false,
    }));
    let sparks: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      life: number;
      color: string;
    }[] = [];

    const end = rockets.at(-1)!.start + height + 10;
    let frame = 0;
    night = true;

    const interval = setInterval(() => {
      frame++;
      for (let i = 0; i < light.length; i++) light[i] *= 0.65;

      for (const rocket of rockets) {
        if (frame < rocket.start || rocket.exploded) continue;
        rocket.y--;
        lit(rocket.x, rocket.y, ROCKET_COLOR, 1);
        if (rocket.y > rocket.top) continue;
        // Explosion: sparks in the 8 directions
        rocket.exploded = true;
        for (const dx of [-1, 0, 1])
          for (const dy of [-1, 0, 1])
            if (dx || dy)
              sparks.push({
                x: rocket.x,
                y: rocket.y,
                dx,
                dy,
                life: 4,
                color: rocket.color,
              });
      }

      for (const spark of sparks) {
        spark.x += spark.dx;
        spark.y += spark.dy;
        spark.dx *= 0.7;
        spark.dy += 0.35; // Gravity
        lit(spark.x, spark.y, spark.color, spark.life / 4);
        spark.life--;
      }
      sparks = sparks.filter((spark) => spark.life > 0);

      sky = Array.from(light, (a, i) =>
        a > 0.05 ? { color: colors[i], a } : undefined,
      );
      if (frame >= end) stopFireworks?.();
    }, FRAME);

    stopFireworks = () => {
      clearInterval(interval);
      night = false;
      sky = [];
      stopFireworks = undefined;
    };
  }

  // Stop the fireworks if the component goes away
  $effect(() => () => stopFireworks?.());

  /** Distance from the last cell placed, to delay the victory wave. */
  const distance = (i: number) =>
    Math.abs(Math.floor(i / grid.width) - Math.floor(lastCell / grid.width)) +
    Math.abs((i % grid.width) - (lastCell % grid.width));

  /**
   * Groups as they were before the current gesture lifted some of them into the
   * selection, so that undo restores them.
   */
  let base: Group[] | undefined;
  /** Color of the first group lifted into the selection, to keep it. */
  let selectionColor: number | undefined;

  function commit(next: Group[]) {
    past.push(base ?? groups);
    future = [];
    groups = next;
    base = undefined;
    checkSolved();
  }

  /** Stops the timer and celebrates when the last group is placed. */
  function checkSolved() {
    if (!solved || startedAt === undefined || endedAt !== undefined) return;
    endedAt = Date.now();
    fireworks();
    onsolve?.(endedAt - startedAt, hintsUsed);
  }

  /** Clears the selection, putting back any group lifted into it. */
  function cancel() {
    if (base) groups = base;
    base = undefined;
    selection = [];
    selectionColor = undefined;
  }

  function undo() {
    if (solved) return;
    cancel();
    const previous = past.pop();
    if (!previous) return;
    future.push(groups);
    groups = previous;
  }

  function redo() {
    if (solved) return;
    cancel();
    const next = future.pop();
    if (!next) return;
    past.push(groups);
    groups = next;
    checkSolved();
  }

  function reset() {
    cancel();
    if (groups.length > 0) commit([]);
    if (endedAt !== undefined) {
      // Replaying a solved grid: restart the timer
      startedAt = endedAt = undefined;
      stopFireworks?.();
    }
  }

  const isComplete = (group: Group) => group.cells.length === grid.groupSize;

  /** Removes group `g` and adds its cells to the selection. */
  function lift(g: number) {
    base ??= groups;
    selectionColor ??= groups[g].color;
    selection.push(...groups[g].cells);
    groups = groups.toSpliced(g, 1);
  }

  /** Turns the selection into a group (partial if not complete yet). */
  function group() {
    // Keep the color of a lifted group if possible, otherwise pick one unused
    // by adjacent groups, preferring the least used one
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
    const color =
      selectionColor !== undefined && !adjacent.has(selectionColor)
        ? selectionColor
        : (free.length > 0 ? free : all).reduce((best, c) =>
            usage(c) < usage(best) ? c : best,
          );
    lastCell = selection.at(-1)!;
    commit([...groups, { cells: selection, color }]);
    selection = [];
    selectionColor = undefined;
  }

  /**
   * Adds cell `i` to the selection (when clicked, or entered while dragging).
   * The selection becomes a group as soon as it holds every digit from 1 to
   * `grid.groupSize`. Picking a cell of an adjacent partial group merges the
   * whole group into the selection.
   */
  function pick(i: number, dragging: boolean) {
    const digit = grid.cells[i];
    if (digit === null || solved) return;
    if (startedAt === undefined) startedAt = now = Date.now();

    const digits = new Set(selection.map((j) => grid.cells[j]));
    const touches = neighbors(grid, i).some((j) => selection.includes(j));

    const g = owner[i];
    if (g >= 0) {
      const { cells } = groups[g];
      const merges =
        touches &&
        !isComplete(groups[g]) &&
        selection.length + cells.length <= grid.groupSize &&
        cells.every((j) => !digits.has(grid.cells[j]));
      if (!merges) return;
      lift(g);
    } else if (selection.includes(i)) {
      if (dragging) {
        // Dragging back over the previous cell undoes the last step
        const rest = selection.slice(0, -1);
        if (selection.at(-2) === i && isConnected(grid, rest)) selection = rest;
      } else {
        const rest = selection.filter((j) => j !== i);
        if (isConnected(grid, rest)) selection = rest;
        else cancel();
      }
      return;
    } else if (touches && !digits.has(digit)) {
      selection.push(i);
    } else if (!dragging || selection.length === 0) {
      cancel();
      selection = [i];
    } else {
      return;
    }

    if (selection.length === grid.groupSize) group();
  }

  /**
   * Ends a gesture: a selection of two cells or more is kept as a partial
   * group, a single cell stays selected.
   */
  function release() {
    if (selection.length >= 2) group();
    else if (base) commit(groups);
  }

  // Pointer interactions: click, or press and drag across cells. Clicking a
  // group removes it; dragging from a partial group extends it.
  let dragging = false;
  let last = -1;
  /** Group under the pointer when the gesture started on a group. */
  let pressed: number | undefined;

  const cellAt = (x: number, y: number) => {
    const el = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>("[data-i]");
    return el ? Number(el.dataset.i) : -1;
  };

  function onpointerdown(event: PointerEvent) {
    if (event.button !== 0 || solved) return;
    const i = cellAt(event.clientX, event.clientY);
    if (i < 0 || grid.cells[i] === null) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragging = true;
    last = i;
    focused = i;

    const g = owner[i];
    const before = selection.length;
    if (g >= 0) pick(i, false);
    // Nothing merged: this is a click (or a drag) on the group itself
    if (g >= 0 && selection.length === before) pressed = g;
    else if (g < 0) pick(i, false);
  }

  /** Keyboard equivalent of a click on cell `i`. */
  function press(i: number) {
    if (solved || grid.cells[i] === null) return;
    const g = owner[i];
    const before = selection.length;
    pick(i, false);
    if (g >= 0 && selection.length === before) {
      cancel();
      commit(groups.toSpliced(g, 1));
    } else {
      release();
    }
  }

  function onpointermove(event: PointerEvent) {
    if (!dragging) return;
    const i = cellAt(event.clientX, event.clientY);
    if (i < 0 || i === last) return;
    last = i;
    focused = i;

    if (pressed !== undefined) {
      const g = pressed;
      pressed = undefined;
      if (isComplete(groups[g])) {
        dragging = false;
        return;
      }
      cancel();
      lift(g);
    }
    pick(i, true);
  }

  function onpointerup() {
    if (!dragging) return;
    dragging = false;
    last = -1;
    if (pressed !== undefined) {
      cancel();
      commit(groups.toSpliced(pressed, 1));
      pressed = undefined;
    } else {
      release();
    }
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
      cancel();
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
      >{complete.length}/{playable / grid.groupSize} groups</span
    >
    <span class="actions">
      {#if gethint}
        <button
          type="button"
          onclick={askHint}
          disabled={solved || hintLoading}
        >
          Hint
        </button>
      {/if}
      <button
        type="button"
        onclick={undo}
        disabled={solved || past.length === 0}
      >
        Undo
      </button>
      <button
        type="button"
        onclick={redo}
        disabled={solved || future.length === 0}
      >
        Redo
      </button>
      <button type="button" onclick={reset} disabled={groups.length === 0}>
        Reset
      </button>
    </span>
  </div>

  <div class="board">
    <div
      class="grid"
      class:solved
      class:night
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
            {@const partial = g >= 0 && groups[g].cells.length < grid.groupSize}
            {@const edgeWidth = selected || partial ? "0.12em" : "0.2em"}
            {@const corners = inRegion && elbows(i, inRegion)}
            <button
              type="button"
              role="gridcell"
              class="cell"
              class:hole={digit === null}
              class:grouped={g >= 0}
              class:partial
              class:selected
              class:dead={dead.has(i) && g < 0 && !selected}
              class:hinted={hinted.has(i)}
              class:wrong={hinted.has(i) && hint?.kind === "wrong"}
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
              style:--delay="{distance(i) * 60}ms"
              style:--glow={sky[i]?.color}
              style:--glow-a={sky[i]?.a ?? 0}
              bind:this={cellElements[i]}
              onfocus={() => (focused = i)}
              onclick={(event) => {
                // Pointer clicks are handled on pointerdown; this is for keyboards
                if (event.detail === 0) press(i);
              }}
            >
              {digit ?? ""}
            </button>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <p class="status" class:won={solved} aria-live="polite">
    {#if solved}
      🎉 Solved in {formatTime(elapsed)}{hintsUsed > 0
        ? ` with ${hintsUsed} hint${hintsUsed > 1 ? "s" : ""}`
        : ""}!
    {:else if hint?.kind === "wrong"}
      💡 The highlighted group is not part of the solution.
    {:else if hint?.kind === "group"}
      💡 The highlighted cells can only form this group.{ruleExplanation(
        hint.rule,
      )}
    {:else if hint?.kind === "together"}
      💡 The highlighted cells must be in the same group.{ruleExplanation(
        hint.rule,
      )}
    {:else if hint?.kind === "none"}
      No hint available.
    {:else if dead.size > 0}
      Some cells can no longer be grouped.
    {:else}
      &nbsp;
    {/if}
  </p>

  {#if solved}
    <div class="share">
      <button type="button" onclick={copyResult}>
        {copied === "yes"
          ? "Copied!"
          : copied === "no"
            ? "Copy failed"
            : "📋 Copy result"}
      </button>
    </div>
  {/if}
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

  .night {
    --sky: 0.92;
    --digit: #f4f4ff;
    --digit-shadow: 0 0 0.12em #0b1026, 0 0 0.3em #0b1026;
  }

  .solved {
    --cursor: default;
    --wave: kukaku-wave;
  }

  .cell {
    --edge: transparent;

    position: relative;
    aspect-ratio: 1;
    padding: 0;
    font:
      500 calc(50cqi / var(--w)) / 1 "Techna Sans",
      sans-serif;
    color: var(--digit, #222);
    text-shadow: var(--digit-shadow, none);
    cursor: var(--cursor, pointer);
    background-color: var(--cell);
    background-repeat: no-repeat;
    border: 0;
    isolation: isolate;
    transition:
      background-color 100ms,
      color 600ms;
    animation: var(--wave, none) 600ms var(--delay) ease-in-out;

    /* Night sky of the fireworks, lit pixel by pixel (see `fireworks`) */
    &::before {
      position: absolute;
      inset: -1px; /* Overlap neighbors to avoid sub-pixel seams */
      z-index: -1;
      pointer-events: none;
      content: "";
      background-color: color-mix(
        in oklab,
        var(--glow, #fff) calc(var(--glow-a) * 100%),
        #0b1026
      );
      opacity: var(--sky, 0);
      transition: opacity 600ms;
    }

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

  .hinted {
    z-index: 1;
    outline: 0.15em dashed #b39800;
    outline-offset: -0.35em;
    animation: hint 1s ease-in-out infinite alternate;
  }

  .wrong {
    outline-color: #c0392b;
  }

  @keyframes hint {
    to {
      outline-offset: -0.25em;
    }
  }

  .grouped {
    background-color: var(--fill);

    &[data-color="0"] {
      --edge: #2f6fb3;
      --fill: #dbe9f8;
    }

    &[data-color="1"] {
      --edge: #c0602a;
      --fill: #fbe3d4;
    }

    &[data-color="2"] {
      --edge: #3b8a4f;
      --fill: #dcf0df;
    }

    &[data-color="3"] {
      --edge: #8a4fb3;
      --fill: #ece0f6;
    }

    &[data-color="4"] {
      --edge: #b3366a;
      --fill: #f8dbe7;
    }

    &[data-color="5"] {
      --edge: #2c8c8c;
      --fill: #d6f0ef;
    }

    &[data-color="6"] {
      --edge: #8a7a2a;
      --fill: #f2edcf;
    }

    &[data-color="7"] {
      --edge: #5a5a75;
      --fill: #e3e3ec;
    }
  }

  /* Partial groups: lighter fill and thinner outline (see `edgeWidth`) */
  .partial {
    background-color: color-mix(in srgb, var(--fill) 55%, var(--cell));
  }

  .status {
    min-height: 1.5em;
    margin-top: 0.75rem;
    text-align: center;
  }

  .share {
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;

    button {
      padding: 0.375em 1em;
      font: inherit;
      font-weight: 500;
      color: #fff;
      cursor: pointer;
      background-color: #2f6fb3;
      border: 0;
      border-radius: 0.25rem;
      animation: pop 500ms 600ms cubic-bezier(0.3, 1.6, 0.5, 1) both;

      &:hover {
        background-color: #255a93;
      }
    }
  }

  .won {
    font-weight: 500;
    animation: pop 500ms 300ms cubic-bezier(0.3, 1.6, 0.5, 1) both;
  }

  /* Victory animation */
  .board {
    position: relative;
    container-type: inline-size;
  }

  /* stylelint-disable-next-line keyframes-name-pattern -- Global (unscoped) so that it can be referenced from a custom property */
  @keyframes -global-kukaku-wave {
    0%,
    100% {
      filter: none;
      translate: 0 0;
    }

    40% {
      filter: brightness(1.08) saturate(1.4);
      translate: 0 -12%;
    }
  }

  @keyframes pop {
    from {
      opacity: 0;
      scale: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .solved {
      --wave: none;
    }

    .won,
    .share button,
    .hinted {
      animation: none;
    }
  }
</style>
