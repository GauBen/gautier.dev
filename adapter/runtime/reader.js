import { getRawAsset } from "node:sea";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

// adapter-node computes its output directory the same way, and everything ends
// up in the same bundle, so file paths start with this directory
const dir = dirname(fileURLToPath(import.meta.url));

/**
 * Opens a file of adapter-node's output from the SEA assets
 *
 * @param {string} file Absolute path, e.g. `${dir}/client/favicon.png`
 * @param {{ start?: number; end?: number }} [range] Inclusive byte range
 * @returns {Readable}
 */
export function open(file, range = {}) {
  const asset = getRawAsset(file.slice(dir.length));
  const start = range.start ?? 0;
  const end = range.end ?? asset.byteLength - 1;
  return Readable.from([Buffer.from(asset, start, end - start + 1)], {
    objectMode: false,
  });
}
