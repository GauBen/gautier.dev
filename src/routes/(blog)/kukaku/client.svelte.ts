import type { GeneratorOptions, Puzzle } from "./generator.js";
import type { Grid } from "./grid.js";
import type { Hint } from "./logic.js";
import type { WorkerRequest, WorkerResponse } from "./worker.js";

type Pending = {
  resolve: (value: never) => void;
  reject: (error: Error) => void;
  type: WorkerRequest["type"];
};

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if ("error" in data) request.reject(new Error(data.error));
    else request.resolve(data.result as never);
  };
  return worker;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

function send<T>(request: DistributiveOmit<WorkerRequest, "id">): Promise<T> {
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject, type: request.type });
    getWorker().postMessage({ ...request, id });
  });
}

/**
 * Generates a puzzle in the worker. A generation still running is abandoned:
 * the worker is restarted, and the previous promise is rejected.
 */
export function generatePuzzle(options: GeneratorOptions): Promise<Puzzle> {
  if ([...pending.values()].some((request) => request.type === "generate")) {
    worker?.terminate();
    worker = undefined;
    for (const request of pending.values())
      request.reject(new Error("Cancelled"));
    pending.clear();
  }
  return send<Puzzle>({ type: "generate", options: $state.snapshot(options) });
}

/** Computes a hint in the worker. */
export function getHint(
  grid: Grid,
  solution: number[][],
  groups: number[][],
): Promise<Hint> {
  // Svelte state proxies cannot be sent to a worker: send plain copies
  return send<Hint>({
    type: "hint",
    grid: $state.snapshot(grid),
    solution: $state.snapshot(solution),
    groups: $state.snapshot(groups),
  });
}
