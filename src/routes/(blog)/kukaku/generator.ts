import { neighbors, type Cell, type Grid } from "./grid.js";
import { Difficulty, rate, type Rating } from "./logic.js";

/** A solution: a list of groups, each a sorted list of cell indices. */
export type Solution = number[][];

/** Score ranges of each difficulty, see `rate`: (low, high]. */
const RANGES: Record<Difficulty, [number, number]> = {
  [Difficulty.Easy]: [-Infinity, 0.25],
  [Difficulty.Medium]: [0.25, 0.6],
  [Difficulty.Hard]: [0.6, Infinity],
};

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

/** Options of a square grid, with as few holes as possible. */
export const squareGrid = (
  size: number,
  groupSize: number,
  difficulty: Difficulty,
  seed: number,
): GeneratorOptions => ({
  width: size,
  height: size,
  groupSize,
  holes: (size * size) % groupSize,
  difficulty,
  seed,
});

export interface Puzzle {
  grid: Grid;
  /** The unique solution. */
  solution: Solution;
  difficulty: Difficulty;
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
 * Restarts before giving up. Every supported setting succeeds within about 10
 * restarts; each restart is bounded, so generation always ends.
 */
const MAX_RESTARTS = 100;

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
 * gets stuck, and gives up after `MAX_RESTARTS` restarts: some settings never
 * reach the requested difficulty (with groups of 2, everything is easy).
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
  const [low, high] = RANGES[difficulty];
  /** How far a score is from the target difficulty (0 if on target). */
  const offTarget = (score: number) =>
    score <= low ? low - score + 1e-9 : Math.max(0, score - high);

  for (let restart = 0; ; restart++) {
    if (restart > MAX_RESTARTS)
      throw new Error("No grid found with these settings");
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
    /** Reshuffles `group`, keeping the change if the new rating is `better`. */
    const refill = (group: number[], better: (next: Rating) => boolean) => {
      const before = group.map((i) => cells[i]);
      fill(group);
      const next = rate(grid);
      if (better(next)) rating = next;
      else group.forEach((i, k) => (cells[i] = before[k]));
    };

    for (let attempt = 0; !rating.solved && attempt < budget; attempt++) {
      // Reshuffle a group the solver could not place
      const placed = new Set(rating.placed.map((group) => group.join()));
      const stuck = solution.filter((group) => !placed.has(group.join()));
      refill(
        stuck[Math.floor(rand() * stuck.length)],
        (next) => next.covered >= rating.covered,
      );
    }
    if (!rating.solved) continue;

    for (
      let attempt = 0;
      offTarget(rating.score) > 0 && attempt < budget;
      attempt++
    )
      refill(
        solution[Math.floor(rand() * solution.length)],
        (next) =>
          next.solved && offTarget(next.score) <= offTarget(rating.score),
      );
    if (offTarget(rating.score) > 0) continue;

    return { grid, solution, difficulty };
  }
}
