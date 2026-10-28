import node from "@sveltejs/adapter-node";
import { uneval } from "devalue";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import prettyBytes from "pretty-bytes";
import * as rolldown from "rolldown";
import { replacePlugin } from "rolldown/plugins";

const runtime = join(import.meta.dirname, "..", "runtime");
const adapter_node_src = join(
  dirname(fileURLToPath(import.meta.resolve("@sveltejs/adapter-node"))),
  "src",
);

/**
 * Makes adapter-node's server read its files from the SEA assets, by replacing
 * the modules it reads files with
 *
 * @type {import("vite").Plugin}
 */
const sea_reader = {
  name: "adapter-node-sea:reader",
  apply: "build",
  // before Vite's resolver, which handles both modules on its own
  enforce: "pre",
  resolveId(id, importer) {
    if (!importer?.startsWith(adapter_node_src)) return;
    if (id === "node:fs") return join(runtime, "fs.js");
    if (id === "@sveltejs/kit/node") return join(runtime, "kit-node.js");
  },
};

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
  const plugins = vite && "plugins" in vite ? vite.plugins : undefined;

  return {
    name: "adapter-node-sea",
    supports,
    vite: {
      ...vite,
      plugins: Array.isArray(plugins)
        ? [sea_reader, ...plugins]
        : { ...plugins, pre: [sea_reader, ...(plugins?.pre ?? [])] },
    },

    async adapt(builder) {
      const cwd = builder.getBuildDirectory("sea");
      rmSync(cwd, { force: true, recursive: true });
      mkdirSync(cwd, { recursive: true });

      // adapter-node builds the server, `sea_reader` makes it read from the SEA assets
      await node({ ...options, out: `${cwd}/adapter-node` }).adapt(builder);

      await rolldown.build({
        input: join(runtime, "index.ts"),
        cwd,
        platform: "node",
        output: {
          codeSplitting: false,
          file: "bundle.js",
          minify,
        },
        plugins: [
          replacePlugin({
            "process.env.NODE_ADAPTER_SEA_BUILD": "true",
          }),
          virtual({
            "virtual:entry": `import ${uneval(`${cwd}/adapter-node/index.js`)};`,
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
              // native addons emitted by rolldown, and the files adapter-node serves
              [
                `${cwd}/assets`,
                `${cwd}/adapter-node/client`,
                `${cwd}/adapter-node/prerendered`,
              ]
                .filter((dir) => existsSync(dir))
                .flatMap((dir) =>
                  totalist(dir).map((file) => [
                    dir === `${cwd}/assets`
                      ? `/${file}`
                      : `/${basename(dir)}/${file}`,
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
      mkdirSync(out, { recursive: true });

      builder.copy(`${cwd}/${exe}`, `${out}/${exe}`);
    },
  };
}
