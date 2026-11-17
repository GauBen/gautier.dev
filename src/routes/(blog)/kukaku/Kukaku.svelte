<script lang="ts">
  import ClipboardText from "@iconify-svelte/ph/clipboard-text-duotone";
  import Confetti from "@iconify-svelte/ph/confetti-duotone";
  import Lightbulb from "@iconify-svelte/ph/lightbulb-duotone";
  import { prefersReducedMotion } from "svelte/motion";
  import { formatHints, formatTime } from "./format.js";
  import Glyph, { glyphName } from "./Glyph.svelte";
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
    symbols = false,
  }: {
    grid: Grid;
    /** Whether to draw symbols (see `Glyph`) instead of digits. */
    symbols?: boolean;
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

  /**
   * Group colors: outline, fill, and square in shared results (distinct, so
   * that adjacent groups, which get different colors, stay apart).
   */
  const PALETTE = [
    ["#2f6fb3", "#dbe9f8", "🟦"],
    ["#c0602a", "#fbe3d4", "🟧"],
    ["#3b8a4f", "#dcf0df", "🟩"],
    ["#8a4fb3", "#ece0f6", "🟪"],
    ["#b3366a", "#f8dbe7", "🟥"],
    ["#2c8c8c", "#d6f0ef", "🟫"],
    ["#8a7a2a", "#f2edcf", "🟨"],
    ["#5a5a75", "#e3e3ec", "⬛"],
  ];
  const id = $props.id();

  /**
   * Message read by screen readers after an action. A trailing no-break space
   * is toggled so that repeating the same message is announced again.
   */
  let announcement = $state("");
  const announce = (message: string) => {
    announcement = announcement === message ? `${message}\u00a0` : message;
  };

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
  const isComplete = (group: Group) => group.cells.length === grid.groupSize;
  const complete = $derived(groups.filter(isComplete));
  const dead = $derived(
    deadCells(grid, new Set(complete.flatMap((group) => group.cells))),
  );
  /** Number of groups to form. */
  const total = $derived(
    grid.cells.filter((c) => c !== null).length / grid.groupSize,
  );
  const solved = $derived(complete.length === total);

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
  const startTimer = () => {
    if (startedAt === undefined) startedAt = now = Date.now();
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
    startTimer();
    cancel();
    hintLoading = true;
    try {
      const asked = groups;
      const result = await gethint(asked.map((group) => group.cells));
      computedHint = { hint: result, groups: asked };
      if (result.kind !== "none") hintsUsed++;
    } catch {
      // Worker unavailable or restarted: no hint this time
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
  function shareText() {
    const { title, url } = share?.() ?? {
      title: "Kukaku",
      url: location.href,
    };
    const rows = Array.from({ length: grid.height }, (_, row) =>
      owner
        .slice(row * grid.width, (row + 1) * grid.width)
        .map((g) => (g >= 0 ? PALETTE[groups[g].color][2] : "⬜"))
        .join(""),
    );
    const hints = hintsUsed > 0 ? ` · 💡 ${formatHints(hintsUsed)}` : "";
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
      announce("Result copied to the clipboard.");
    } catch {
      copied = "no";
      announce("The result could not be copied.");
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
    if (prefersReducedMotion.current) return;
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
    // Columns away from the edges, so that the explosions stay in the grid
    const columns = Array.from({ length: Math.max(1, width - 2) }, (_, k) => [
      Math.random(),
      k + 1,
    ])
      .sort(([a], [b]) => a - b)
      .map(([, x]) => x);
    // An opening salvo of 5 rockets, launched every 3 frames or so (each one
    // takes about 5 frames to rise, so they overlap) from alternating columns,
    // then a finale of up to 4 rockets launched almost together, in distinct
    // columns, while the last ones of the salvo explode
    const jitter = (frames: number) => Math.floor(Math.random() * frames);
    const rockets = [
      ...Array.from({ length: 5 }, (_, k) => [
        columns[k % columns.length],
        4 + 3 * k + jitter(2),
      ]),
      ...columns.slice(0, 4).map((x) => [x, 20 + jitter(3)]),
    ].map(([x, start]) => ({
      x,
      y: height,
      // Explodes between the second row and one row below the middle
      top: 1 + Math.floor(Math.random() * (Math.max(1, height / 2 - 1) + 1)),
      color: pick(SPARK_COLORS),
      start,
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

    const end = 22 + height + 10; // Once the last rocket has faded
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
    announce("Undone.");
  }

  function redo() {
    if (solved) return;
    cancel();
    const next = future.pop();
    if (!next) return;
    past.push(groups);
    groups = next;
    announce("Redone.");
    checkSolved();
  }

  function reset() {
    cancel();
    if (groups.length > 0) commit([]);
    announce("Grid cleared.");
    if (endedAt !== undefined) {
      // Replaying a solved grid: restart the timer
      startedAt = endedAt = undefined;
      stopFireworks?.();
    }
  }

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
    const all = PALETTE.map((_, c) => c);
    const free = all.filter((c) => !adjacent.has(c));
    const color =
      selectionColor !== undefined && !adjacent.has(selectionColor)
        ? selectionColor
        : (free.length > 0 ? free : all).reduce((best, c) =>
            usage(c) < usage(best) ? c : best,
          );
    lastCell = selection.at(-1)!;
    const size = selection.length;
    commit([...groups, { cells: selection, color }]);
    selection = [];
    selectionColor = undefined;
    if (size < grid.groupSize) announce(`Partial group of ${size} cells.`);
    else if (!solved)
      announce(`Group complete, ${complete.length} of ${total}.`);
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
    startTimer();

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
   * group. A single cell extends an adjacent partial group that can take its
   * digit (the most recent one), so that grids can be solved by clicks alone;
   * otherwise, it stays selected.
   */
  function release() {
    const [i] = selection;
    const h =
      selection.length === 1
        ? Math.max(
            -1,
            ...neighbors(grid, i)
              .map((j) => owner[j])
              .filter(
                (h) =>
                  h >= 0 &&
                  !isComplete(groups[h]) &&
                  groups[h].cells.every((j) => grid.cells[j] !== grid.cells[i]),
              ),
          )
        : -1;
    if (h >= 0) {
      selection = [];
      lift(h);
      selection.push(i);
    }
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

    pressed = click(i);
  }

  /**
   * Picks cell `i` at the start of a click. Returns the group clicked, unless
   * it was merged into the selection.
   */
  function click(i: number) {
    const g = owner[i];
    const before = selection.length;
    pick(i, false);
    return g >= 0 && selection.length === before ? g : undefined;
  }

  /** Ends a click: breaks the group clicked, or ends the gesture. */
  function unclick(g: number | undefined) {
    if (g === undefined) {
      release();
      if (selection.length > 0)
        announce(`${selection.length} of ${grid.groupSize} cells selected.`);
      return;
    }
    cancel();
    commit(groups.toSpliced(g, 1));
    announce("Group removed.");
  }

  /** Keyboard equivalent of a click on cell `i`. */
  function press(i: number) {
    if (solved || grid.cells[i] === null) return;
    unclick(click(i));
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
    unclick(pressed);
    pressed = undefined;
  }

  // Keyboard interactions: arrows to move, Enter/Space to pick
  let cellElements = $state<HTMLElement[]>([]);

  function onkeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && (key === "z" || key === "y")) {
      event.preventDefault();
      if (key === "y" || event.shiftKey) redo();
      else undo();
      return;
    }
    if (event.key === "Escape") {
      if (selection.length > 0) announce("Selection cleared.");
      cancel();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      press(focused);
      return;
    }

    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const [dr, dc] = moves[event.key] ?? [0, 0];
    if (!dr && !dc) return;
    event.preventDefault();
    const r = Math.floor(focused / grid.width) + dr;
    const c = (focused % grid.width) + dc;
    if (r < 0 || r >= grid.height || c < 0 || c >= grid.width) return;
    focused = r * grid.width + c;
    cellElements[focused]?.focus();
  }

  /**
   * Outline of the region `i` belongs to, as background layers: sides (dashed
   * for partial groups, 4 dashes per cell split at the corners so that the
   * pattern runs on from cell to cell), and squares filling inner elbows (both
   * orthogonal neighbors of a corner are in the region, the diagonal is not).
   * All backgrounds, so that browsers snap them to device pixels alike.
   */
  function backgrounds(
    i: number,
    inRegion: (j: number) => boolean,
    width: string,
    dashed: boolean,
  ) {
    const row = Math.floor(i / grid.width);
    const col = i % grid.width;
    const has = (dr: number, dc: number) =>
      row + dr >= 0 &&
      row + dr < grid.height &&
      col + dc >= 0 &&
      col + dc < grid.width &&
      inRegion(i + dr * grid.width + dc);
    const solid = "linear-gradient(var(--edge) 0 0)";
    const side = (direction: string) =>
      dashed
        ? `repeating-linear-gradient(${direction}, var(--edge) 0 6.25%, transparent 0 18.75%, var(--edge) 0 25%)`
        : solid;

    const layers = [
      ...(
        [
          [-1, 0, "top"],
          [0, 1, "right"],
          [1, 0, "bottom"],
          [0, -1, "left"],
        ] as const
      )
        .filter(([dr, dc]) => !has(dr, dc))
        .map(([dr, , position]) =>
          dr
            ? [side("to right"), `100% ${width}`, position]
            : [side("to bottom"), `${width} 100%`, position],
        ),
      ...(
        [
          [-1, -1, "top left"],
          [-1, 1, "top right"],
          [1, 1, "bottom right"],
          [1, -1, "bottom left"],
        ] as const
      )
        .filter(([dr, dc]) => has(dr, 0) && has(0, dc) && !has(dr, dc))
        .map(([, , position]) => [solid, `${width} ${width}`, position]),
    ];
    if (layers.length === 0) return undefined;
    const list = (k: number) => layers.map((layer) => layer[k]).join(", ");
    return { image: list(0), size: list(1), position: list(2) };
  }

  function describe(i: number) {
    const row = Math.floor(i / grid.width) + 1;
    const col = (i % grid.width) + 1;
    const digit = grid.cells[i];
    const position = `row ${row}, column ${col}`;
    if (digit === null) return `Hole, ${position}`;
    const g = owner[i];
    const state =
      g >= 0
        ? isComplete(groups[g])
          ? "in a complete group"
          : `in a partial group of ${groups[g].cells.length}`
        : selection.includes(i)
          ? `selected, ${selection.length} of ${grid.groupSize}`
          : dead.has(i)
            ? "free, cannot be grouped anymore"
            : "free";
    const highlight = !hinted.has(i)
      ? ""
      : hint?.kind === "wrong"
        ? ", wrong group"
        : ", highlighted by the hint";
    const value = symbols ? glyphName(digit) : digit;
    return `${value}, ${state}${highlight}, ${position}`;
  }
</script>

<div class="kukaku" style:--w={grid.width}>
  <div class="toolbar">
    <span class="timer"
      ><span class="sr-only">Elapsed time: </span>{formatTime(elapsed)}</span
    >
    <span class="progress">
      <span aria-hidden="true">{complete.length}/{total} groups</span>
      <span class="sr-only">{complete.length} of {total} groups complete</span>
    </span>
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

  <div
    class="grid"
    class:solved
    class:night
    role="grid"
    aria-label="Kukaku grid"
    aria-describedby="{id}-keys"
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
          {@const partial = g >= 0 && !isComplete(groups[g])}
          {@const edgeWidth = selected || partial ? "0.12em" : "0.2em"}
          {@const layers = inRegion
            ? backgrounds(i, inRegion, edgeWidth, partial)
            : undefined}
          <!-- svelte-ignore a11y_click_events_have_key_events (Enter and Space are handled by the grid, see `onkeydown`) -->
          <div
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
            style:--edge={g >= 0 ? PALETTE[groups[g].color][0] : undefined}
            style:--fill={g >= 0 ? PALETTE[groups[g].color][1] : undefined}
            tabindex={i === focused ? 0 : -1}
            aria-label={describe(i)}
            aria-selected={selected}
            aria-disabled={digit === null}
            style:--layers={layers?.image}
            style:--layers-size={layers?.size}
            style:--layers-position={layers?.position}
            style:--delay="{distance(i) * 60}ms"
            style:--glow={sky[i]?.color}
            style:--glow-a={sky[i]?.a ?? 0}
            bind:this={cellElements[i]}
            onfocus={() => (focused = i)}
            onclick={(event) => {
              // Pointer clicks are handled on pointerdown; this is for
              // assistive technologies activating the cell
              if (event.detail === 0) press(i);
            }}
          >
            {#if digit !== null}
              {#if symbols}<Glyph {digit} />{:else}{digit}{/if}
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <p id="{id}-keys" class="sr-only">
    Use the arrow keys to move, Enter or Space to add a cell to the group being
    formed or to remove a group, Escape to clear the selection, Control+Z to
    undo and Control+Y to redo.
  </p>
  <p class="sr-only" aria-live="polite">{announcement}</p>

  <p class="status" class:won={solved} aria-live="polite">
    {#if solved}
      <Confetti aria-hidden="true" /> Solved in {formatTime(
        elapsed,
      )}{hintsUsed > 0 ? ` with ${formatHints(hintsUsed)}` : ""}!
    {:else if hintLoading}
      Looking for a hint…
    {:else if hint && hint.kind !== "none"}
      <Lightbulb aria-hidden="true" />
      {hint.kind === "wrong"
        ? "The highlighted group is not part of the solution."
        : `The highlighted cells ${hint.kind === "group" ? "can only form this group" : "must be in the same group"}.${ruleExplanation(hint.rule)}`}
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
        {#if copied === "yes"}
          Copied!
        {:else if copied === "no"}
          Copy failed
        {:else}
          <ClipboardText aria-hidden="true" /> Copy result
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  .kukaku {
    --line: #0002;
    --cell: #fff;
    --selected: #fff6b3;
    --accent: #8a7400; /* Selection and hints, 4.5:1 on white */

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
    border: 1px solid #0007; /* 3:1 against the background */
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
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    font:
      500 calc(50cqi / var(--w)) / 1 "Techna Sans",
      sans-serif;
    color: var(--digit, #222);
    text-shadow: var(--digit-shadow, none);
    cursor: var(--cursor, pointer);
    background-color: var(--cell);

    /* Outline layers (see `backgrounds`) over the thin cell separators, which
       the last column and row do not have */
    background-image:
      var(--layers, none), linear-gradient(var(--line) 0 0),
      linear-gradient(var(--line) 0 0);
    background-repeat: no-repeat;
    background-position: var(--layers-position, 0 0), right, bottom;
    background-size:
      var(--layers-size, auto),
      var(--separator-x, 1px) 100%,
      100% var(--separator-y, 1px);
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

    &:focus-visible {
      z-index: 1;
      outline: 0.15em solid var(--link);
      outline-offset: -0.15em;
    }

    &:last-child {
      --separator-x: 0;
    }

    .row:last-child & {
      --separator-y: 0;
    }

    &:hover:not(.grouped, .selected, .hole) {
      background-color: #f2f2f8;
    }
  }

  .hole {
    --layers: repeating-linear-gradient(
      -45deg,
      #ddd 0 0.25em,
      #eee 0.25em 0.5em
    );
    --layers-size: 100% 100%;

    cursor: default;
  }

  .selected {
    --edge: var(--accent);

    background-color: var(--selected);
  }

  .dead {
    color: #c0392b;
    background-color: #fdecea;
  }

  .hinted {
    z-index: 1;
    outline: 0.15em dashed var(--accent);
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
  }

  /* Partial groups: lighter fill and thinner dashed outline (see `edgeWidth`) */
  .partial {
    background-color: color-mix(in srgb, var(--fill) 55%, var(--cell));
  }

  .status,
  .share {
    :global(svg) {
      width: 1.25em;
      height: 1.25em;
      vertical-align: -0.25em;
    }
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

  /* Groups are drawn with backgrounds and shadows, which forced colors (such as
     Windows high contrast) would remove: keep the colors of the grid */
  @media (forced-colors: active) {
    .grid {
      forced-color-adjust: none;
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
