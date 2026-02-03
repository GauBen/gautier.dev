import { uneval } from "devalue";
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import prettyBytes from "pretty-bytes";
import * as rolldown from "rolldown";

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
export function totalist(root, subdir = "") {
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
          format: "cjs",
          codeSplitting: false,
          file: "bundle.js",
        },
        plugins: [
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
          }),
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
