/**
 * This module a port of sirv for Node SEA mode, trimmed for SvelteKit's use
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
import { buildDate } from "virtual:manifest";

const noop = () => {};

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
  const opts: { start?: number; end?: number } = {};
  const size = asset.byteLength;

  let value;
  for (const key in headers) {
    if ((value = res.getHeader(key))) headers[key] = value;
  }

  if (req.headers.range) {
    code = 206;
    let [x, y] = req.headers.range.replace("bytes=", "").split("-");
    let end = (opts.end = parseInt(y, 10) || size - 1);
    let start = (opts.start = parseInt(x, 10) || 0);

    if (end >= size) {
      end = size - 1;
    }

    if (start >= size) {
      res.setHeader("Content-Range", `bytes */${size}`);
      res.statusCode = 416;
      return res.end();
    }

    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    headers["Content-Length"] = end - start + 1;
    headers["Accept-Ranges"] = "bytes";
  }

  res.writeHead(code, headers);
  res.end(
    Buffer.from(
      asset,
      opts.start,
      (opts.end ?? size - 1) - (opts.start ?? 0) + 1,
    ),
  );
}

const ENCODING = {
  ".br": "br",
  ".gz": "gzip",
};

function toHeaders(name: string, asset: ArrayBuffer) {
  const enc = ENCODING[name.slice(-3) as keyof typeof ENCODING];

  const ctype = mrmime.lookup(enc ? name.slice(0, -3) : name) || "";

  const headers: Record<string, string | number | string[]> = {
    "Content-Length": asset.byteLength,
    "Content-Type": ctype + (ctype === "text/html" ? ";charset=utf-8" : ""),
    "Last-Modified": buildDate.toUTCString(),
    "Cache-Control": "no-cache",
    "ETag": `W/"${asset.byteLength}-${buildDate.getTime()}"`,
  };

  if (enc) headers["Content-Encoding"] = enc;

  return headers;
}

export default function (
  opts: {
    setHeaders?: (res: ServerResponse, pathname: string) => void;
  } = {},
): Middleware {
  let setHeaders = opts.setHeaders || noop;

  return function (req, res, next) {
    const extensions = ["", "html"];
    const acceptEncoding = req.headers["accept-encoding"]?.toLowerCase() || "";
    if (acceptEncoding.includes("gzip")) extensions.unshift("gz", "html.gz");
    if (acceptEncoding.includes("br")) extensions.unshift("br", "html.br");

    let { pathname } = parse(req);
    if (pathname.indexOf("%") !== -1) {
      try {
        pathname = decodeURI(pathname);
      } catch (err) {
        /* malform uri */
      }
    }

    let data =
      pathname.charCodeAt(pathname.length - 1) === 47
        ? lookup(
            pathname,
            extensions.map((ext) => (ext ? `index.${ext}` : "index")),
          )
        : lookup(pathname, extensions);

    if (!data) return next();

    if (req.headers["if-none-match"] === data.headers["ETag"]) {
      res.writeHead(304);
      res.end();
      return;
    }

    res.setHeader("Vary", "Accept-Encoding");

    setHeaders(res, pathname);
    send(req, res, data.asset, data.headers);
  };
}
