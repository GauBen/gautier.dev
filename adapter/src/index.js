import node from "@sveltejs/adapter-node";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import prettyBytes from "pretty-bytes";
import * as rolldown from "rolldown";

const runtime = join(import.meta.dirname, "..", "runtime");

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

/**
 * @param {Object} [opt={}] Default is `{}`
 * @param {boolean} [opt.precompress=true] Default is `true`
 * @param {string} [opt.envPrefix=""] Default is `""`
 * @param {string} [opt.out="build"] Default is `"build"`
 * @param {boolean | import("rolldown").OutputOptions["minify"]} [opt.minify="dce-only"]
 *   See [Rolldown
 *   documentation](https://rolldown.rs/reference/OutputOptions.minify#minify).
 *   Default is `"dce-only"`
 * @returns {import("@sveltejs/kit").Adapter}
 */
export default function adapter({
  precompress = true,
  envPrefix = "",
  minify = "dce-only",
  out = "build",
} = {}) {
  const options = { precompress, envPrefix };
  const { supports, vite } = node(options);

  return {
    name: "adapter-node-sea",
    supports,
    vite,

    async adapt(builder) {
      const cwd = builder.getBuildDirectory("sea");
      rmSync(cwd, { force: true, recursive: true });

      // adapter-node builds the server. In the executable, its files are read
      // from the SEA assets mounted as a virtual file system next to bundle.js
      await node({ ...options, out: `${cwd}/adapter-node` }).adapt(builder);

      await rolldown.build({
        input: join(runtime, "index.ts"),
        cwd,
        platform: "node",
        resolve: {
          alias: { "virtual:entry": `${cwd}/adapter-node/index.js` },
        },
        output: {
          codeSplitting: false,
          file: "bundle.js",
          minify,
        },
        plugins: [
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
                // loaded from the virtual file system at runtime, not bundled
                return `const addon = ${JSON.stringify(`./${this.getFileName(emitted)}`)};
module.exports = require(addon);`;
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
            // mounts the assets as a file system, with bundle.js at its root
            useVfs: true,
            assets: Object.fromEntries(
              // native addons emitted by rolldown, and the files adapter-node serves
              [
                [`${cwd}/assets`, "assets"],
                [`${cwd}/adapter-node/client`, "client"],
                [`${cwd}/adapter-node/prerendered`, "prerendered"],
              ]
                .filter(([dir]) => existsSync(dir))
                .flatMap(([dir, prefix]) =>
                  totalist(dir).map((file) => [
                    `${prefix}/${file}`,
                    `${dir}/${file}`,
                  ]),
                ),
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

      rmSync(out, { force: true, recursive: true });

      builder.copy(`${cwd}/${exe}`, `${out}/${exe}`);
    },
  };
}
