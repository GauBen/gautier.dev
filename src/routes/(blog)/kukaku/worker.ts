/// <reference lib="webworker" />
// Runs the expensive computations (generation, hints) off the main thread.
import { generate, type GeneratorOptions, type Puzzle } from "./generator.js";
import { hint, type Hint } from "./logic.js";
import type { Grid } from "./grid.js";

export type WorkerRequest =
  | { id: number; type: "generate"; options: GeneratorOptions }
  | {
      id: number;
      type: "hint";
      grid: Grid;
      solution: number[][];
      groups: number[][];
    };

export type WorkerResponse =
  { id: number; result: Puzzle | Hint } | { id: number; error: string };

self.onmessage = ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    const result =
      data.type === "generate"
        ? generate(data.options)
        : hint(data.grid, data.solution, data.groups);
    self.postMessage({ id: data.id, result } satisfies WorkerResponse);
  } catch (error) {
    self.postMessage({
      id: data.id,
      error: String(error),
    } satisfies WorkerResponse);
  }
};
