import { neighbors, type Cell, type Grid } from "./grid.js";
import { countSolutions, type Solution } from "./solver.js";

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
}

export interface Puzzle {
  grid: Grid;
  /** The unique solution. */
  solution: Solution;
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
 * Generates a puzzle with a unique solution.
 *
 * 1. Pick random holes and tile the rest of the grid with groups of cells.
 * 2. Fill each group with a random permutation of 1 to `groupSize`.
 * 3. While other solutions exist, reshuffle the digits of a random group, keeping
 *    the change if it does not increase the number of solutions.
 *
 * The intended tiling stays a solution throughout, so the result is unique once
 * the count reaches 1. Restarts from scratch if it gets stuck.
 */
export function generate({
  width,
  height,
  groupSize,
  holes,
  seed,
}: GeneratorOptions): Puzzle {
  const size = width * height;
  if (groupSize < 2 || groupSize > 9)
    throw new Error("groupSize must be between 2 and 9");
  if (holes < 0 || holes > size - groupSize || (size - holes) % groupSize !== 0)
    throw new Error(
      "width × height − holes must be a positive multiple of groupSize",
    );

  const rand = random(seed);
  const CAP = 64;

  for (;;) {
    const holeSet = new Set(
      shuffle(
        Array.from({ length: size }, (_, i) => i),
        rand,
      ).slice(0, holes),
    );
    const solution = tile(width, height, groupSize, holeSet, rand);
    if (!solution) continue;

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
    let count = countSolutions(grid, CAP);

    for (
      let attempt = 0;
      count > 1 && attempt < 50 * solution.length;
      attempt++
    ) {
      const group = solution[Math.floor(rand() * solution.length)];
      const before = group.map((i) => cells[i]);
      fill(group);
      const next = countSolutions(grid, CAP);
      if (next <= count) count = next;
      else group.forEach((i, k) => (cells[i] = before[k]));
    }

    if (count === 1)
      return {
        grid,
        solution: solution.map((group) => group.toSorted((a, b) => a - b)),
      };
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
