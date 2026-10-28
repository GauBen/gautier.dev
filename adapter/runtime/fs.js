// Replaces `node:fs` for adapter-node's server: files are read from the SEA assets
import fs from "node:fs";
import { open } from "./reader.js";

export * from "node:fs";
export { open as createReadStream };
export default { ...fs, createReadStream: open };
