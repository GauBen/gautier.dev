import { neighbors, type Cell, type Grid } from "./grid.js";
import { Difficulty, DIFFICULTY_RANGES, difficultyOf, rate } from "./logic.js";
import type { Solution } from "./solver.js";

export interface GeneratorOptions {
  width: number;
  height: number;
  /** Number of cells (and digits) per group. */
  groupSize: number;
  /**
   * Number of holes; `width * height - holes` must be a multiple of
   * `groupSize`.
   */
  holes: number;
  seed: number;
  difficulty?: Difficulty;
}

export interface Puzzle {
  grid: Grid;
  /** The unique solution. */
  solution: Solution;
  difficulty: Difficulty;
  /** Difficulty score, see `rate`. */
  score: number;
}

/** Small seeded PRNG (mulberry32), returns floats in [0, 1). */
export function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], rand: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Randomly tiles the non-hole cells with groups of `n` connected cells. Always
 * extends the first free cell in reading order, so that every cell gets
 * covered; returns `undefined` if no tiling exists.
 */
function tile(
  width: number,
  height: number,
  n: number,
  holes: ReadonlySet<number>,
  rand: () => number,
): Solution | undefined {
  const shape: Grid = { width, height, groupSize: n, cells: [] };
  const size = width * height;
  const taken = new Uint8Array(size);
  for (const i of holes) taken[i] = 1;
  const groups: number[][] = [];

  /** All connected sets of `n` free cells whose lowest index is `start`. */
  const shapesFrom = (start: number) => {
    const found = new Map<string, number[]>();
    const grow = (group: number[]) => {
      if (group.length === n) {
        found.set(group.toSorted((a, b) => a - b).join(), group);
        return;
      }
      for (const cell of group) {
        for (const n of neighbors(shape, cell)) {
          if (n > start && !taken[n] && !group.includes(n)) grow([...group, n]);
        }
      }
    };
    grow([start]);
    return shuffle([...found.values()], rand);
  };

  let steps = 0;
  const recurse = (from: number): boolean => {
    if (++steps > 10_000) return false;
    let start = from;
    while (start < size && taken[start]) start++;
    if (start === size) return true;

    for (const group of shapesFrom(start)) {
      for (const i of group) taken[i] = 1;
      groups.push(group);
      if (recurse(start + 1)) return true;
      groups.pop();
      for (const i of group) taken[i] = 0;
    }
    return false;
  };

  return recurse(0) ? groups : undefined;
}

/**
 * Generates a puzzle that can be solved by deduction alone (see `logic.ts`),
 * with the requested difficulty. Such a puzzle has a unique solution.
 *
 * 1. Pick random holes and tile the rest of the grid with groups of cells.
 * 2. Fill each group with a random permutation of 1 to `groupSize`.
 * 3. While the logical solver gets stuck, reshuffle the digits of a group it could
 *    not place, keeping the change if the solver gets at least as far.
 * 4. While the difficulty is off, reshuffle the digits of a random group, keeping
 *    the change if the grid stays solvable and its difficulty score gets closer
 *    to the target range.
 *
 * The intended tiling stays a solution throughout. Restarts from scratch if it
 * gets stuck.
 */
export function generate({
  width,
  height,
  groupSize,
  holes,
  seed,
  difficulty = Difficulty.Medium,
}: GeneratorOptions): Puzzle {
  const size = width * height;
  if (groupSize < 2 || groupSize > 9)
    throw new Error("groupSize must be between 2 and 9");
  if (holes < 0 || holes > size - groupSize || (size - holes) % groupSize !== 0)
    throw new Error(
      "width × height − holes must be a positive multiple of groupSize",
    );

  const rand = random(seed);
  const [low, high] = DIFFICULTY_RANGES[difficulty];
  /** How far a score is from the target difficulty (0 if on target). */
  const offTarget = (score: number) =>
    difficultyOf(score) === difficulty
      ? 0
      : score <= low
        ? low - score + 1e-9
        : score - high;

  for (;;) {
    const holeSet = new Set(
      shuffle(
        Array.from({ length: size }, (_, i) => i),
        rand,
      ).slice(0, holes),
    );
    const tiling = tile(width, height, groupSize, holeSet, rand);
    if (!tiling) continue;
    const solution = tiling.map((group) => group.toSorted((a, b) => a - b));

    const cells = Array.from({ length: size }, (): Cell => null);
    const fill = (group: number[]) => {
      const digits = shuffle(
        Array.from({ length: groupSize }, (_, k) => k + 1),
        rand,
      );
      group.forEach((i, k) => (cells[i] = digits[k]));
    };
    for (const group of solution) fill(group);

    const grid: Grid = { width, height, groupSize, cells };
    let rating = rate(grid);
    const budget = 20 * solution.length;

    for (let attempt = 0; !rating.solved && attempt < budget; attempt++) {
      // Reshuffle a group the solver could not place
      const placed = new Set(rating.placed.map((group) => group.join()));
      const stuck = solution.filter((group) => !placed.has(group.join()));
      const group = stuck[Math.floor(rand() * stuck.length)];
      const before = group.map((i) => cells[i]);
      fill(group);
      const next = rate(grid);
      if (next.covered >= rating.covered) rating = next;
      else group.forEach((i, k) => (cells[i] = before[k]));
    }
    if (!rating.solved) continue;

    for (
      let attempt = 0;
      offTarget(rating.score) > 0 && attempt < budget;
      attempt++
    ) {
      const group = solution[Math.floor(rand() * solution.length)];
      const before = group.map((i) => cells[i]);
      fill(group);
      const next = rate(grid);
      if (next.solved && offTarget(next.score) <= offTarget(rating.score))
        rating = next;
      else group.forEach((i, k) => (cells[i] = before[k]));
    }
    if (offTarget(rating.score) > 0) continue;

    return { grid, solution, difficulty, score: rating.score };
  }
}

/** Formats a grid in the text form read by `parseGrid`. */
export function formatGrid({ width, cells }: Grid): string {
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += width)
    rows.push(
      cells
        .slice(i, i + width)
        .map((c) => c ?? "#")
        .join(" "),
    );
  return rows.join("\n");
}
