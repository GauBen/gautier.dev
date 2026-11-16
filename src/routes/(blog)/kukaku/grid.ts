/** A digit, or `null` for a hole (a dead cell that belongs to no group). */
export type Cell = number | null;

export interface Grid {
  width: number;
  height: number;
  /** Number of cells per group; groups hold the digits 1 to `groupSize`. */
  groupSize: number;
  /** Row-major cells, indexed by `row * width + col`. */
  cells: Cell[];
}

/**
 * Parses a grid from its text form: one row per line, cells separated by
 * whitespace, `#` for holes. The group size is the largest digit.
 */
export function parseGrid(text: string): Grid {
  const rows = text
    .trim()
    .split("\n")
    .map((line) => line.trim().split(/\s+/));
  const width = rows[0].length;
  if (rows.some((row) => row.length !== width))
    throw new Error("All rows must have the same length");

  const cells = rows.flat().map((token): Cell => {
    if (token === "#") return null;
    if (/^[1-9]$/.test(token)) return Number(token);
    throw new Error(`Invalid cell: ${token}`);
  });
  const groupSize = Math.max(...cells.map((cell) => cell ?? 0));

  return { width, height: rows.length, groupSize, cells };
}

/** Orthogonal neighbors of cell `i`. */
export function neighbors({ width, height }: Grid, i: number): number[] {
  const row = Math.floor(i / width);
  const col = i % width;
  const result: number[] = [];
  if (row > 0) result.push(i - width);
  if (col < width - 1) result.push(i + 1);
  if (row < height - 1) result.push(i + width);
  if (col > 0) result.push(i - 1);
  return result;
}

/** Whether `cells` form a single orthogonally connected region. */
export function isConnected(grid: Grid, cells: readonly number[]): boolean {
  if (cells.length === 0) return true;
  const set = new Set(cells);
  const seen = new Set([cells[0]]);
  const stack = [cells[0]];
  while (stack.length > 0) {
    for (const n of neighbors(grid, stack.pop()!)) {
      if (set.has(n) && !seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen.size === set.size;
}

/**
 * Cells that can no longer be grouped: free cells in a connected region of free
 * cells that does not contain as many of each digit.
 */
export function deadCells(grid: Grid, taken: ReadonlySet<number>): Set<number> {
  const dead = new Set<number>();
  const seen = new Set<number>();
  const isFree = (i: number) => grid.cells[i] !== null && !taken.has(i);

  for (let start = 0; start < grid.cells.length; start++) {
    if (!isFree(start) || seen.has(start)) continue;

    const region = [start];
    seen.add(start);
    for (let k = 0; k < region.length; k++) {
      for (const n of neighbors(grid, region[k])) {
        if (isFree(n) && !seen.has(n)) {
          seen.add(n);
          region.push(n);
        }
      }
    }

    const counts = Array.from({ length: grid.groupSize }, () => 0);
    for (const i of region) counts[grid.cells[i]! - 1]++;
    if (counts.some((count) => count !== counts[0]))
      for (const i of region) dead.add(i);
  }

  return dead;
}
