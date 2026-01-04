import virtual from "@rollup/plugin-virtual";
import { uneval } from "devalue";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inject } from "postject";
import * as rolldown from "rolldown";

/**
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

// console.log(JSON.stringify(totalist(".svelte-kit/sea/assets"), null, 2));

/** @returns {import("@sveltejs/kit").Adapter} */
export default function adapter() {
  const precompress = true;
  const envPrefix = "";

  return {
    name: "adapter-node-sea",

    async adapt(builder) {
      const tmp = builder.getBuildDirectory("sea");
      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      builder.writeClient(
        `${tmp}/assets/client${builder.config.kit.paths.base}`,
      );
      builder.writePrerendered(
        `${tmp}/assets/prerendered${builder.config.kit.paths.base}`,
      );

      if (precompress) await builder.compress(`${tmp}/assets`);

      builder.writeServer(`${tmp}/server`);
      await rolldown.build({
        input: join(import.meta.dirname, "..", "runtime", "index.ts"),
        cwd: tmp,
        platform: "node",
        output: {
          format: "cjs",
          inlineDynamicImports: true,
          file: "bundle.js",
        },
        define: {
          ENV_PREFIX: JSON.stringify(envPrefix),
        },
        plugins: [
          virtual({
            "virtual:manifest": [
              `export const manifest = ${builder.generateManifest({ relativePath: "./server" })};`,
              `export const prerendered = ${uneval(builder.prerendered)};`,
              `export const base = ${JSON.stringify(builder.config.kit.paths.base)};`,
              `export const buildDate = new Date(${Date.now()});`,
            ].join("\n\n"),
            "virtual:server": `export { Server } from "./server/index.js";`,
          }),
        ],
      });

      writeFileSync(
        `${tmp}/sea-manifest.json`,
        JSON.stringify(
          {
            main: `${tmp}/bundle.js`,
            output: `${tmp}/bundle.blob`,
            assets: Object.fromEntries(
              totalist(`${tmp}/assets`).map((file) => [
                `/${file}`,
                `${tmp}/assets/${file}`,
              ]),
            ),
          },
          null,
          2,
        ),
      );

      builder.copy(process.execPath, `${tmp}/node`);
      execFileSync(`${tmp}/node`, [
        "--experimental-sea-config",
        `${tmp}/sea-manifest.json`,
      ]);

      await inject(
        `${tmp}/node`,
        "NODE_SEA_BLOB",
        readFileSync(`${tmp}/bundle.blob`),
        { sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2" },
      );

      const out = "build";
      builder.rimraf(out);
      builder.mkdirp(out);

      builder.copy(`${tmp}/node`, `${out}/app`);
    },
  };
}
