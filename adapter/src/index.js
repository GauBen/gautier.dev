import virtual from "@rollup/plugin-virtual";
import { uneval } from "devalue";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inject } from "postject";
import prettyBytes from "pretty-bytes";
import * as rolldown from "rolldown";

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
export default function adapter() {
  const precompress = true;
  const envPrefix = "";

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
          inlineDynamicImports: true,
          file: "bundle.js",
        },
        define: {
          BUILD_ISO_DATE: JSON.stringify(new Date().toISOString()),
          ENV_PREFIX: JSON.stringify(envPrefix),
        },
        plugins: [
          virtual({
            "virtual:manifest": [
              `export const manifest = ${builder.generateManifest({ relativePath: "./server" })};`,
              `export const prerendered = ${uneval(builder.prerendered)};`,
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

      writeFileSync(
        `${cwd}/sea-manifest.json`,
        JSON.stringify(
          {
            main: `${cwd}/bundle.js`,
            output: `${cwd}/bundle.blob`,
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

      builder.copy(process.execPath, `${cwd}/node`);
      execFileSync(`${cwd}/node`, [
        "--experimental-sea-config",
        `${cwd}/sea-manifest.json`,
      ]);

      console.info(
        `bundle.blob: ${prettyBytes(statSync(`${cwd}/bundle.blob`).size)}`,
      );

      console.info(`node: ${prettyBytes(statSync(`${cwd}/node`).size)}`);

      if (process.platform === "darwin") execFileSync("codesign", ["--remove-signature", `${cwd}/node`]);

      await inject(
        `${cwd}/node`,
        "NODE_SEA_BLOB",
        readFileSync(`${cwd}/bundle.blob`),
        {
          sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
          machoSegmentName: "NODE_SEA",
        },
      );

      if (process.platform === "darwin") execFileSync("codesign", ["--sign", "-", `${cwd}/node`]);

      console.info(`app: ${prettyBytes(statSync(`${cwd}/node`).size)}`);

      const out = "build";
      builder.rimraf(out);
      builder.mkdirp(out);

      builder.copy(`${cwd}/node`, `${out}/node`);
    },
  };
}
