// Replaces `@sveltejs/kit/node` for adapter-node's server: files are read from the SEA assets
import { Readable } from "node:stream";
import { open } from "./reader.js";

export * from "@sveltejs/kit/node";

/** @param {string} file */
export function createReadableStream(file) {
  return /** @type {ReadableStream} */ (Readable.toWeb(open(file)));
}
