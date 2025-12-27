import type { Adapter } from "@sveltejs/kit";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { inject } from "postject";
import * as rolldown from "rolldown";

export default function adapter(): Adapter {
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
        input: "virtual:entry",
        cwd: resolve(tmp),
        platform: "node",
        output: {
          format: "cjs",
          inlineDynamicImports: true,
          file: "bundle.js",
        },
        plugins: [
          {
            name: "virtual-entry",
            resolveId(id) {
              if (id === "virtual:entry") return id;
            },
            load(id) {
              if (id === "virtual:entry") {
                return `import { Server } from './server/index.js';
import { getRequest, setResponse } from '@sveltejs/kit/node';
import polka from 'polka';
import { getRawAsset, getAssetKeys } from 'node:sea';
import { lookup } from 'mrmime';
import polka_url_parser from '@polka/url';

const server = new Server(${builder.generateManifest({ relativePath: "./server" })});
const origin = process.env.ORIGIN || 'http://localhost:3000';

const ssr = async (req, res) => {
	let request;

	try {
		request = await getRequest({
			base: origin,
			request: req,
			bodySizeLimit: '512K'
		});
	} catch {
		res.statusCode = 400;
		res.end('Bad Request');
		return;
	}

	await setResponse(
		res,
		await server.respond(request, {
			platform: { req },
			getClientAddress: () => {
				return (
					req.connection?.remoteAddress ||
					req.connection?.socket?.remoteAddress ||
					req.socket?.remoteAddress ||
					req.info?.remoteAddress
				);
			}
		})
	);
};

const knownAssets = new Set(getAssetKeys());
const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});

const app = polka()
  .get("/*", (req, res, next) => {
    let { pathname, search, query } = polka_url_parser(req);

		try {
			pathname = decodeURIComponent(pathname);
		} catch {
			// ignore invalid URI
		}

		if (prerendered.has(pathname)) {
      if (knownAssets.has(pathname + '.html')) {
        const asset = getRawAsset(pathname + '.html');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(Buffer.from(asset));
        return;
      }
      const asset = getRawAsset(pathname);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(Buffer.from(asset));
      return;
		}

		// remove or add trailing slash as appropriate
		let location = pathname.at(-1) === '/' ? pathname.slice(0, -1) : pathname + '/';
		if (prerendered.has(location)) {
			if (query) location += search;
			res.writeHead(308, { location }).end();
		} else {
			void next();
		}
  })
  .get("/*", (req, res, next) => {
    if (!knownAssets.has(req.path)) {
      next();
      return;
    }
    const asset = getRawAsset(req.path);
    res.setHeader('Content-Type', lookup(req.path) || 'application/octet-stream');
    res.end(Buffer.from(asset));
  })
  .use(ssr);

const host = '0.0.0.0';
const port = 3000;

server.init({ env: process.env }).then(() => {
  app.listen({ host, port }, () => {
    console.log("Listening on http://%s:%s", host, port);
  });
});
`;
              }
            },
          },
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
