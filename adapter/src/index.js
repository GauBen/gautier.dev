import { uneval } from "devalue";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import prettyBytes from "pretty-bytes";
import * as rolldown from "rolldown";
import { replacePlugin } from "rolldown/plugins";

/** Adapted from @rollup/plugin-virtual under MIT License */
const PREFIX = `\0virtual:`;
function virtual(/** @type {Record<string, string>} */ modules) {
  return {
    name: "virtual",
    resolveId(/** @type {string} */ id) {
      if (id in modules) return PREFIX + id;
    },
    load(/** @type {string} */ id) {
      if (id.startsWith(PREFIX)) return modules[id.slice(PREFIX.length)];
    },
  };
}

/**
 * Returns all files under a directory recursively.
 *
 * Adapted from https://github.com/lukeed/totalist under MIT License
 *
 * @param {string} root
 * @param {string} [subdir]
 * @returns {string[]}
 */
function totalist(root, subdir = "") {
  const out = [];
  for (const entry of readdirSync(join(root, subdir))) {
    if (statSync(join(root, subdir, entry)).isDirectory())
      out.push(...totalist(root, join(subdir, entry)));
    else out.push(join(subdir, entry));
  }
  return out;
}

/** @returns {import("@sveltejs/kit").Adapter} */
export default function adapter({ precompress = true, envPrefix = "" } = {}) {
  return {
    name: "adapter-node-sea",

    supports: {
      read: () => true,
      instrumentation: () => true,
    },

    async adapt(builder) {
      const cwd = builder.getBuildDirectory("sea");
      builder.rimraf(cwd);
      builder.mkdirp(cwd);

      builder.writeClient(
        `${cwd}/assets/client${builder.config.kit.paths.base}`,
      );
      builder.writePrerendered(
        `${cwd}/assets/prerendered${builder.config.kit.paths.base}`,
      );

      if (precompress) await builder.compress(`${cwd}/assets`);

      builder.writeServer(`${cwd}/server`);
      await rolldown.build({
        input: join(import.meta.dirname, "..", "runtime", "index.ts"),
        cwd,
        platform: "node",
        output: {
          codeSplitting: false,
          file: "bundle.js",
        },
        plugins: [
          replacePlugin({ "process.env.IS_ADAPTER_BUILD": "true" }),
          virtual({
            "virtual:manifest": [
              `export const manifest = ${builder.generateManifest({ relativePath: "./server" })};`,
              `export const prerendered = ${uneval(builder.prerendered)};`,
              `export const last_modified = ${uneval(new Date().toISOString())};`,
              `export const env_prefix = ${uneval(envPrefix)};`,
              `export const precompress = ${uneval(precompress)};`,
            ].join("\n"),
            "virtual:server": [
              `export { Server } from "./server/index.js";`,
              `export { options } from "./server/internal.js";`,
            ].join("\n"),
            "virtual:instrumentation": builder.hasServerInstrumentationFile()
              ? `export * from "./server/instrumentation.server.js";`
              : `export {};`,
          }),
          {
            name: "js-bindings-processor",
            transform: {
              filter: { id: /js-binding\.js$/ },
              handler(_, id) {
                const moduleName = id.slice(
                  id.lastIndexOf("node_modules/") + "node_modules/".length,
                  id.lastIndexOf("/js-binding.js"),
                );
                return `module.exports = require("${moduleName}-${process.platform}-${process.arch}${process.platform === "linux" ? "-gnu" : ""}");`;
              },
            },
          },
          {
            name: "externalize-node-modules",
            load: {
              filter: { id: /\.node$/ },
              handler(id) {
                const emitted = this.emitFile({
                  type: "asset",
                  originalFileName: id,
                  name: basename(id),
                  source: readFileSync(id),
                });
                return `
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { getRawAsset } = require("node:sea");

const name = ${uneval(this.getFileName(emitted).slice("assets".length))};
const addonPath = path.join(os.tmpdir(), name);
fs.writeFileSync(addonPath, new Uint8Array(getRawAsset(name)));
const myaddon = { exports: {} };
process.dlopen(myaddon, addonPath);
fs.rmSync(addonPath);
module.exports = myaddon.exports;`;
              },
            },
          },
        ],
      });

      console.info(
        `bundle.js: ${prettyBytes(statSync(`${cwd}/bundle.js`).size)}`,
      );

      const exe = basename(process.execPath);

      writeFileSync(
        `${cwd}/sea-config.json`,
        JSON.stringify(
          {
            main: `${cwd}/bundle.js`,
            output: `${cwd}/${exe}`,
            mainFormat: "module",
            assets: Object.fromEntries(
              totalist(`${cwd}/assets`).map((file) => [
                `/${file}`,
                `${cwd}/assets/${file}`,
              ]),
            ),
          },
          null,
          2,
        ),
      );

      execFileSync(process.execPath, ["--build-sea", `${cwd}/sea-config.json`]);

      if (process.platform === "darwin")
        execFileSync("codesign", ["--sign", "-", `${cwd}/${exe}`]);

      console.info(`node: ${prettyBytes(statSync(`${cwd}/${exe}`).size)}`);

      const out = "build";
      builder.rimraf(out);
      builder.mkdirp(out);

      builder.copy(`${cwd}/${exe}`, `${out}/${exe}`);
    },
  };
}
