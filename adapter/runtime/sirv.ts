/**
 * This code is a port of sirv for Node SEA mode, trimmed for SvelteKit's use
 * case.
 *
 * Original code under MIT License from
 * https://github.com/lukeed/sirv/blob/1135207e92c40354543cbd15c763c7a61d79d432/packages/sirv/index.mjs
 */

import { parse } from "@polka/url";
import * as mrmime from "mrmime";
import { IncomingMessage, ServerResponse } from "node:http";
import { getAssetKeys, getRawAsset } from "node:sea";
import { Middleware } from "polka";
import { options } from "virtual:server";

const encodings = new Map([
  [".br", "br"],
  [".gz", "gzip"],
]);
function toHeaders(name: string, asset: ArrayBuffer) {
  const enc = encodings.get(name.slice(-3));

  const ctype = mrmime.lookup(enc ? name.slice(0, -3) : name) || "";

  const headers: Record<string, string | number | string[]> = {
    "Content-Length": asset.byteLength,
    "Content-Type": ctype + (ctype === "text/html" ? ";charset=utf-8" : ""),
    "Last-Modified": BUILD_ISO_DATE,
    "Cache-Control": "no-cache",
    "ETag": `W/"${asset.byteLength}-${options.version_hash}"`,
  };

  if (enc) headers["Content-Encoding"] = enc;

  return headers;
}

const assetKeys = new Set(getAssetKeys());
function lookup(pathname: string, extns: string[]) {
  for (const ext of extns) {
    const name = pathname + ext;
    if (assetKeys.has(name)) {
      const asset = getRawAsset(name);
      const headers = toHeaders(name, asset);
      return { asset, headers };
    }
  }
}

function send(
  req: IncomingMessage,
  res: ServerResponse,
  asset: ArrayBuffer,
  headers: Record<string, string | number | string[]>,
) {
  let code = 200;
  const size = asset.byteLength;
  let start = 0;
  let end = size - 1;

  for (const key in headers) {
    const value = res.getHeader(key);
    if (value) headers[key] = value;
  }

  if (req.headers.range) {
    code = 206;
    const [x, y] = req.headers.range.replace("bytes=", "").split("-");
    end = parseInt(y, 10) || size - 1;
    start = parseInt(x, 10) || 0;

    if (start >= size) {
      res.setHeader("Content-Range", `bytes */${size}`);
      res.statusCode = 416;
      return res.end();
    }

    if (end >= size) end = size - 1;

    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    headers["Content-Length"] = end - start + 1;
    headers["Accept-Ranges"] = "bytes";
  }

  res.writeHead(code, headers);
  res.end(Buffer.from(asset, start, end - start + 1));
}

export default function sirv(
  keyPrefix: string,
  opts: {
    setHeaders?: (res: ServerResponse, pathname: string) => void;
  } = {},
): Middleware {
  return (req, res, next) => {
    const extensions = ["", ".html"];
    const acceptEncoding = req.headers["accept-encoding"]?.toLowerCase() || "";
    if (acceptEncoding.includes("gzip")) extensions.unshift(".gz", ".html.gz");
    if (acceptEncoding.includes("br")) extensions.unshift(".br", ".html.br");

    let { pathname } = parse(req);
    if (pathname.indexOf("%") !== -1) {
      try {
        pathname = decodeURI(pathname);
      } catch {
        /* malformed uri */
      }
    }

    if (pathname.at(-1) === "/") pathname += "index";

    const data = lookup(keyPrefix + pathname, extensions);

    if (!data) return next();

    if (req.headers["if-none-match"] === data.headers["ETag"]) {
      res.writeHead(304);
      res.end();
      return;
    }

    res.setHeader("Vary", "Accept-Encoding");

    opts.setHeaders?.(res, pathname);
    send(req, res, data.asset, data.headers);
  };
}
