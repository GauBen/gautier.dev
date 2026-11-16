import { neighbors, type Grid } from "./grid.js";
import { candidateGroups } from "./solver.js";

/**
 * Deduction rules, from easiest to hardest. Every rule is sound: it only
 * eliminates groups that belong to no solution, and only places groups that
 * belong to every solution. Hence, if the rules cover the whole grid, the
 * solution is unique.
 */
export const Rule = {
  /** A cell is covered by a single possible group: place it. */
  Forced: 1,
  /**
   * All possible groups of cell A contain cell B: A and B go together, so
   * groups containing B but not A are eliminated.
   */
  Together: 2,
  /**
   * Placing a group would leave a region of free cells without as many of each
   * digit: that group is eliminated.
   */
  Region: 3,
  /**
   * Placing a group would leave a cell without any possible group: that group
   * is eliminated.
   */
  Lookahead: 4,
} as const;
export type Rule = (typeof Rule)[keyof typeof Rule];

export interface Step {
  rule: Rule;
  /** Group placed by the step (`Forced`). */
  placed?: number[];
  /** Cells deduced to be together (`Together`). */
  together?: [number, number];
  /** Groups eliminated by the step. */
  eliminated: number[][];
}

/** State of a logical resolution: possible groups and placed groups. */
export class Deduction {
  readonly grid: Grid;
  /** Every valid group of the grid. */
  readonly candidates: number[][];
  /** Candidate indices covering each cell. */
  readonly byCell: number[][];
  readonly alive: Uint8Array;
  /** Cells covered by placed groups (holes count as covered). */
  readonly taken: Uint8Array;
  readonly placed: number[][] = [];
  free = 0;

  constructor(grid: Grid) {
    this.grid = grid;
    this.candidates = candidateGroups(grid);
    this.byCell = Array.from(grid.cells, () => []);
    this.candidates.forEach((group, g) => {
      for (const i of group) this.byCell[i].push(g);
    });
    this.alive = new Uint8Array(this.candidates.length).fill(1);
    this.taken = new Uint8Array(grid.cells.length);
    grid.cells.forEach((digit, i) => {
      if (digit === null) this.taken[i] = 1;
      else this.free++;
    });
  }

  get solved(): boolean {
    return this.free === 0;
  }

  /** Alive candidates covering cell `i`. */
  options(i: number): number[] {
    return this.byCell[i].filter((g) => this.alive[g]);
  }

  /** Places candidate `g`, eliminating the candidates overlapping it. */
  place(g: number): number[][] {
    const eliminated: number[][] = [];
    const group = this.candidates[g];
    for (const i of group) {
      this.taken[i] = 1;
      for (const h of this.byCell[i]) {
        if (h !== g && this.alive[h]) {
          this.alive[h] = 0;
          eliminated.push(this.candidates[h]);
        }
      }
    }
    this.alive[g] = 0;
    this.placed.push(group);
    this.free -= group.length;
    return eliminated;
  }

  /** Index of the candidate made of exactly `cells`, or -1. */
  find(cells: readonly number[]): number {
    if (cells.length === 0) return -1;
    const key = cells.toSorted((a, b) => a - b).join();
    return (
      this.byCell[cells[0]].find((g) => this.candidates[g].join() === key) ?? -1
    );
  }

  /**
   * Records that `cells` belong to the same group (e.g. a partial group drawn
   * by the player), eliminating candidates that split them.
   */
  together(cells: readonly number[]) {
    for (const i of cells) {
      for (const g of this.byCell[i]) {
        if (this.alive[g] && cells.some((j) => !this.candidates[g].includes(j)))
          this.alive[g] = 0;
      }
    }
  }

  /** Free cells that must share a group with `i`, given alive candidates. */
  partners(i: number): number[] {
    const options = this.options(i);
    if (options.length === 0) return [];
    return this.candidates[options[0]].filter(
      (j) => j !== i && options.every((g) => this.candidates[g].includes(j)),
    );
  }

  /** Applies the easiest rule (up to `maxRule`) that makes progress. */
  step(maxRule: Rule = Rule.Lookahead): Step | undefined {
    return (
      this.forced() ??
      (maxRule >= Rule.Together ? this.togetherRule() : undefined) ??
      (maxRule >= Rule.Region ? this.regionRule() : undefined) ??
      (maxRule >= Rule.Lookahead ? this.lookaheadRule() : undefined)
    );
  }

  /** Applies rules until stuck or solved; returns the hardest rule used. */
  run(maxRule: Rule = Rule.Lookahead): Rule | 0 {
    let hardest: Rule | 0 = 0;
    for (let step = this.step(maxRule); step; step = this.step(maxRule))
      if (step.rule > hardest) hardest = step.rule;
    return hardest;
  }

  private forced(): Step | undefined {
    for (let i = 0; i < this.taken.length; i++) {
      if (this.taken[i]) continue;
      const options = this.options(i);
      if (options.length === 1) {
        const placed = this.candidates[options[0]];
        return {
          rule: Rule.Forced,
          placed,
          eliminated: this.place(options[0]),
        };
      }
    }
  }

  private togetherRule(): Step | undefined {
    for (let a = 0; a < this.taken.length; a++) {
      if (this.taken[a]) continue;
      for (const b of this.partners(a)) {
        const eliminated: number[][] = [];
        for (const g of this.byCell[b]) {
          if (this.alive[g] && !this.candidates[g].includes(a)) {
            this.alive[g] = 0;
            eliminated.push(this.candidates[g]);
          }
        }
        if (eliminated.length > 0)
          return { rule: Rule.Together, together: [a, b], eliminated };
      }
    }
  }

  /** Whether placing `group` leaves only regions with balanced digits. */
  private balancedWithout(group: readonly number[]): boolean {
    const { grid } = this;
    const blocked = new Set(group);
    const seen = new Set<number>();
    // Only regions around the group can have changed
    for (const start of group.flatMap((i) => neighbors(grid, i))) {
      if (this.taken[start] || blocked.has(start) || seen.has(start)) continue;
      const counts = Array.from({ length: grid.groupSize }, () => 0);
      const stack = [start];
      seen.add(start);
      while (stack.length > 0) {
        const i = stack.pop()!;
        counts[grid.cells[i]! - 1]++;
        for (const n of neighbors(grid, i)) {
          if (!this.taken[n] && !blocked.has(n) && !seen.has(n)) {
            seen.add(n);
            stack.push(n);
          }
        }
      }
      if (counts.some((count) => count !== counts[0])) return false;
    }
    return true;
  }

  private regionRule(): Step | undefined {
    const eliminated: number[][] = [];
    this.alive.forEach((alive, g) => {
      if (alive && !this.balancedWithout(this.candidates[g])) {
        this.alive[g] = 0;
        eliminated.push(this.candidates[g]);
      }
    });
    if (eliminated.length > 0) return { rule: Rule.Region, eliminated };
  }

  /** Whether placing `group` leaves some free cell without any option. */
  private starves(group: readonly number[]): boolean {
    const inGroup = new Set(group);
    const checked = new Set<number>();
    for (const i of group) {
      for (const h of this.byCell[i]) {
        if (!this.alive[h]) continue;
        for (const d of this.candidates[h]) {
          if (inGroup.has(d) || checked.has(d)) continue;
          checked.add(d);
          const survives = this.byCell[d].some(
            (k) =>
              this.alive[k] && this.candidates[k].every((j) => !inGroup.has(j)),
          );
          if (!survives) return true;
        }
      }
    }
    return false;
  }

  private lookaheadRule(): Step | undefined {
    const eliminated: number[][] = [];
    this.alive.forEach((alive, g) => {
      if (alive && this.starves(this.candidates[g])) {
        this.alive[g] = 0;
        eliminated.push(this.candidates[g]);
      }
    });
    if (eliminated.length > 0) return { rule: Rule.Lookahead, eliminated };
  }
}

export const Difficulty = { Easy: 1, Medium: 2, Hard: 3 } as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

/** Score ranges of each difficulty, see `rate`. */
export const DIFFICULTY_RANGES: Record<Difficulty, [number, number]> = {
  [Difficulty.Easy]: [0, 0.25],
  [Difficulty.Medium]: [0.25, 0.6],
  [Difficulty.Hard]: [0.6, Infinity],
};

export interface Rating {
  solved: boolean;
  /** Cells covered once stuck. */
  covered: number;
  /** Groups placed by the rules. */
  placed: number[][];
  /**
   * How much reasoning the grid needs: number of steps beyond placing forced
   * groups (counting double the harder rules), per group to place.
   */
  score: number;
}

/**
 * Solves `grid` by deduction, always applying the easiest rule available, and
 * rates how hard it was.
 */
export function rate(grid: Grid): Rating {
  const deduction = new Deduction(grid);
  const total = deduction.free;
  let effort = 0;
  for (let step = deduction.step(); step; step = deduction.step()) {
    if (step.rule === Rule.Together) effort += 1;
    else if (step.rule > Rule.Together) effort += 2;
  }
  return {
    solved: deduction.solved,
    covered: total - deduction.free,
    placed: deduction.placed,
    score: effort / (total / grid.groupSize),
  };
}

export const difficultyOf = (score: number): Difficulty =>
  score <= DIFFICULTY_RANGES[Difficulty.Easy][1]
    ? Difficulty.Easy
    : score <= DIFFICULTY_RANGES[Difficulty.Medium][1]
      ? Difficulty.Medium
      : Difficulty.Hard;

export type Hint =
  | { kind: "wrong"; cells: number[] }
  | { kind: "group"; cells: number[]; rule: Rule }
  | { kind: "together"; cells: number[]; rule: Rule }
  | { kind: "none" };

/**
 * Finds the next deduction the player can make, given their current groups
 * (complete or partial) and the unique solution.
 */
export function hint(
  grid: Grid,
  solution: readonly (readonly number[])[],
  groups: readonly (readonly number[])[],
): Hint {
  // 1. Point out a group that contradicts the solution
  const solutionOf = new Map<number, number>();
  solution.forEach((group, s) => {
    for (const i of group) solutionOf.set(i, s);
  });
  for (const group of groups) {
    const s = solutionOf.get(group[0]);
    if (group.some((i) => solutionOf.get(i) !== s))
      return { kind: "wrong", cells: [...group] };
  }

  // 2. Start from what the player knows
  const deduction = new Deduction(grid);
  const sameGroup = new Map<number, number>();
  groups.forEach((group, k) => {
    for (const i of group) sameGroup.set(i, k);
    const g = deduction.find(group);
    if (group.length === grid.groupSize && g >= 0) deduction.place(g);
    else deduction.together(group);
  });
  const known = (a: number, b: number) =>
    sameGroup.has(a) && sameGroup.get(a) === sameGroup.get(b);

  // 3. Apply rules until something new and visible comes up
  const visible = (rule: Rule): Hint | undefined => {
    for (const group of deduction.placed) {
      if (!group.every((i) => known(group[0], i)))
        return { kind: "group", cells: group, rule };
    }
    for (let a = 0; a < grid.cells.length; a++) {
      if (deduction.taken[a]) continue;
      const options = deduction.options(a);
      if (options.length === 1) {
        const cells = deduction.candidates[options[0]];
        if (!cells.every((i) => known(a, i)))
          return { kind: "group", cells, rule };
      }
    }
    // Prefer pairs of adjacent cells, that the player can group right away
    let distant: Hint | undefined;
    for (let a = 0; a < grid.cells.length; a++) {
      if (deduction.taken[a]) continue;
      for (const b of deduction.partners(a)) {
        if (known(a, b)) continue;
        if (neighbors(grid, a).includes(b))
          return { kind: "together", cells: [a, b], rule };
        distant ??= { kind: "together", cells: [a, b], rule };
      }
    }
    return distant;
  };

  let rule: Rule = Rule.Forced;
  for (;;) {
    const found = visible(rule);
    if (found) return found;
    const step = deduction.step();
    if (!step) return { kind: "none" };
    rule = step.rule;
  }
}
