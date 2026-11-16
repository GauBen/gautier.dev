import { neighbors, type Grid } from "./grid.js";

/** A solution: a list of groups, each a sorted list of cell indices. */
export type Solution = number[][];

/**
 * Every possible group of the grid: `groupSize` orthogonally connected cells
 * holding each digit once. Each group is a sorted list of cell indices.
 */
export function candidateGroups(grid: Grid): number[][] {
  const found = new Map<string, number[]>();

  const grow = (group: number[]) => {
    if (group.length === grid.groupSize) {
      const sorted = group.toSorted((a, b) => a - b);
      found.set(sorted.join(), sorted);
      return;
    }
    const digits = new Set(group.map((i) => grid.cells[i]));
    for (const cell of group) {
      for (const n of neighbors(grid, cell)) {
        if (grid.cells[n] === null || group.includes(n)) continue;
        if (digits.has(grid.cells[n])) continue;
        grow([...group, n]);
      }
    }
  };

  grid.cells.forEach((digit, i) => {
    if (digit !== null) grow([i]);
  });
  return [...found.values()];
}

/**
 * Enumerates solutions of `grid`, calling `onSolution` for each one. Stops
 * early when `onSolution` returns `false`.
 *
 * This is an exact cover search: at each step, it picks the free cell covered
 * by the fewest available groups, and tries each of them.
 */
export function search(
  grid: Grid,
  onSolution: (solution: Solution) => boolean | void,
): void {
  const size = grid.cells.length;
  const groups = candidateGroups(grid);
  const byCell: number[][] = Array.from({ length: size }, () => []);
  groups.forEach((group, g) => {
    for (const i of group) byCell[i].push(g);
  });

  const taken = new Uint8Array(size);
  let free = 0;
  for (let i = 0; i < size; i++) {
    if (grid.cells[i] === null) taken[i] = 1;
    else free++;
  }
  if (free % grid.groupSize !== 0) return;

  const isAvailable = (g: number) => groups[g].every((i) => !taken[i]);
  const chosen: number[][] = [];
  let stopped = false;

  const recurse = (free: number) => {
    if (free === 0) {
      if (onSolution(chosen.map((group) => [...group])) === false)
        stopped = true;
      return;
    }

    // Most constrained free cell
    let best = -1;
    let bestOptions: number[] = [];
    for (let i = 0; i < size; i++) {
      if (taken[i]) continue;
      const options = byCell[i].filter(isAvailable);
      if (best < 0 || options.length < bestOptions.length) {
        best = i;
        bestOptions = options;
        if (options.length <= 1) break;
      }
    }

    for (const g of bestOptions) {
      const group = groups[g];
      for (const i of group) taken[i] = 1;
      chosen.push(group);
      recurse(free - grid.groupSize);
      chosen.pop();
      for (const i of group) taken[i] = 0;
      if (stopped) return;
    }
  };

  recurse(free);
}

/** Returns up to `limit` solutions of `grid`. */
export function solve(grid: Grid, limit = Infinity): Solution[] {
  const solutions: Solution[] = [];
  search(grid, (solution) => {
    solutions.push(solution);
    return solutions.length < limit;
  });
  return solutions;
}

/** Counts solutions of `grid`, stopping at `limit`. */
export function countSolutions(grid: Grid, limit = Infinity): number {
  let count = 0;
  search(grid, () => ++count < limit);
  return count;
}
