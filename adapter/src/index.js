import virtual from "@rollup/plugin-virtual";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { inject } from "postject";
import * as rolldown from "rolldown";

/** @returns {import("@sveltejs/kit").Adapter} */
export default function adapter() {
  return {
    name: "adapter-node-sea",

    async adapt(builder) {
      const tmp = builder.getBuildDirectory("sea");
      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      const client = builder.writeClient(
        `${tmp}/client${builder.config.kit.paths.base}`,
      );
      const prerendered = builder.writePrerendered(
        `${tmp}/prerendered${builder.config.kit.paths.base}`,
      );
      builder.writeServer(`${tmp}/server`);

      await rolldown.build({
        input: join(import.meta.dirname, "..", "runtime", "index.ts"),
        cwd: resolve(tmp),
        platform: "node",
        output: {
          format: "cjs",
          inlineDynamicImports: true,
          file: "bundle.js",
        },
        define: {
          ENV_PREFIX: '""',
        },
        plugins: [
          virtual({
            "virtual:manifest": [
              `export const manifest = ${builder.generateManifest({ relativePath: "./server" })};`,
              `export const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});`,
              `export const base = ${JSON.stringify(builder.config.kit.paths.base)};`,
              `export const buildDate = new Date(${Date.now()});`,
            ].join("\n\n"),
            "virtual:server": `export { Server } from "./server/index.js";`,
          }),
        ],
      });

      writeFileSync(
        `${tmp}/sea-manifest.json`,
        JSON.stringify({
          main: `${tmp}/bundle.js`,
          output: `${tmp}/bundle.blob`,
          assets: Object.fromEntries([
            ...client.map((file) => [`/${file}`, `${tmp}/client/${file}`]),
            ...prerendered.map((file) => [
              `/${file}`,
              `${tmp}/prerendered/${file}`,
            ]),
          ]),
        }),
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
