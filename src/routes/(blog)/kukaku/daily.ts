import { squareGrid, type GeneratorOptions } from "./generator.js";
import { Difficulty } from "./logic.js";

/**
 * Daily grid settings by day of the week (1 = Monday … 7 = Sunday), getting
 * harder as the week goes on.
 */
const SCHEDULE: Record<
  number,
  [size: number, groupSize: number, difficulty: Difficulty]
> = {
  1: [5, 4, Difficulty.Easy],
  2: [6, 4, Difficulty.Easy],
  3: [6, 4, Difficulty.Medium],
  4: [7, 4, Difficulty.Medium],
  5: [6, 5, Difficulty.Medium],
  6: [7, 4, Difficulty.Hard],
  7: [8, 4, Difficulty.Hard],
};

/** Generator options of the daily grid of `date`. */
export function dailyOptions(date: Temporal.PlainDate): GeneratorOptions {
  const [size, groupSize, difficulty] = SCHEDULE[date.dayOfWeek];
  const seed = date.year * 10_000 + date.month * 100 + date.day;
  return squareGrid(size, groupSize, difficulty, seed);
}
