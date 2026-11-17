import { dailyOptions } from "./daily.js";
import { squareGrid, type GeneratorOptions } from "./generator.js";
import { Difficulty } from "./logic.js";

export const SIZES = [5, 6, 7, 8];
export const GROUP_SIZES = [2, 3, 4, 5, 6];
/** Difficulties, with their name and letter in codes. */
export const DIFFICULTIES: [Difficulty, string, string][] = [
  [Difficulty.Easy, "Easy", "e"],
  [Difficulty.Medium, "Medium", "m"],
  [Difficulty.Hard, "Hard", "h"],
];

/** With groups of 2, every grid is easy: harder levels cannot be generated. */
export const available = (groupSize: number, difficulty: Difficulty) =>
  groupSize > 2 || difficulty === Difficulty.Easy;

/**
 * Reads the code of a grid in its URL: a date for daily grids (e.g.
 * `2026-11-17`), or `<size><group size><difficulty><seed>` for random ones
 * (e.g. `64h123456`; seeds are 32-bit integers, hence at most 10 digits).
 */
export function parseCode(
  code: string,
): { date?: Temporal.PlainDate; options: GeneratorOptions } | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(code)) {
    try {
      const date = Temporal.PlainDate.from(code, { overflow: "reject" });
      return { date, options: dailyOptions(date) };
    } catch {
      return undefined;
    }
  }
  const match = /^(\d)(\d)([emh])(\d{1,10})$/.exec(code);
  if (!match) return undefined;
  const [size, groupSize, seed] = [match[1], match[2], match[4]].map(Number);
  const difficulty = DIFFICULTIES.find(
    ([, , letter]) => letter === match[3],
  )![0];
  if (
    !SIZES.includes(size) ||
    !GROUP_SIZES.includes(groupSize) ||
    !available(groupSize, difficulty)
  )
    return undefined;
  return { options: squareGrid(size, groupSize, difficulty, seed) };
}

/** Code of a new random grid. */
export function randomCode(
  size: number,
  groupSize: number,
  difficulty: Difficulty,
) {
  const letter = DIFFICULTIES.find(([d]) => d === difficulty)![2];
  return `${size}${groupSize}${letter}${Math.floor(Math.random() * 1_000_000)}`;
}
