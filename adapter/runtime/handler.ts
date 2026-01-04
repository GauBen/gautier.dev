import { parse as polka_url_parser } from "@polka/url";
import { getRequest, setResponse } from "@sveltejs/kit/node";
import { IncomingHttpHeaders } from "node:http";
import process from "node:process";
import polka, { Middleware } from "polka";
import { manifest, prerendered } from "virtual:manifest";
import { Server } from "virtual:server";
import { env } from "./env.js";
import sirv from "./sirv.js";
import { parse_as_bytes } from "./utils.js";

// declare const ENV_PREFIX: string;

const server = new Server(manifest);

const origin = env("ORIGIN");
const xff_depth = parseInt(env("XFF_DEPTH", "1"));
const address_header = env("ADDRESS_HEADER", "").toLowerCase();
const protocol_header = env("PROTOCOL_HEADER", "").toLowerCase();
const host_header = env("HOST_HEADER", "").toLowerCase();
const port_header = env("PORT_HEADER", "").toLowerCase();

const body_size_limit = parse_as_bytes(env("BODY_SIZE_LIMIT", "512K"));

if (isNaN(body_size_limit)) {
  throw new Error(
    `Invalid BODY_SIZE_LIMIT: '${env("BODY_SIZE_LIMIT")}'. Please provide a numeric value.`,
  );
}

// required because the static file server ignores trailing slashes
function serve_prerendered(): Middleware {
  const handler = sirv("/prerendered", {
    setHeaders(res, pathname) {
      if (prerendered.assets.has(pathname))
        res.setHeader("Content-Type", prerendered.assets.get(pathname)!.type);
    },
  });

  const prerenderedPaths = new Set(prerendered.paths);

  return (req, res, next) => {
    let { pathname, search, query } = polka_url_parser(req);

    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      // ignore invalid URI
    }

    if (prerenderedPaths.has(pathname)) {
      return handler(req, res, next);
    }

    // remove or add trailing slash as appropriate
    let location =
      pathname.at(-1) === "/" ? pathname.slice(0, -1) : pathname + "/";
    if (prerenderedPaths.has(location)) {
      if (query) location += search;
      res.writeHead(308, { location }).end();
    } else {
      return next();
    }
  };
}

const ssr: Middleware = async (req, res) => {
  let request: Request;

  try {
    request = await getRequest({
      base: origin || get_origin(req.headers),
      request: req,
      bodySizeLimit: body_size_limit,
    });
  } catch {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  await setResponse(
    res,
    await server.respond(request, {
      platform: { req },
      getClientAddress: () => {
        if (address_header) {
          if (!(address_header in req.headers)) {
            throw new Error(
              `Address header was specified with ${
                ENV_PREFIX + "ADDRESS_HEADER"
              }=${address_header} but is absent from request`,
            );
          }

          const value = (req.headers[address_header] as string) || "";

          if (address_header === "x-forwarded-for") {
            const addresses = value.split(",");

            if (xff_depth < 1) {
              throw new Error(
                `${ENV_PREFIX + "XFF_DEPTH"} must be a positive integer`,
              );
            }

            if (xff_depth > addresses.length) {
              throw new Error(
                `${ENV_PREFIX + "XFF_DEPTH"} is ${xff_depth}, but only found ${
                  addresses.length
                } addresses`,
              );
            }
            return addresses[addresses.length - xff_depth].trim();
          }

          return value;
        }

        return (
          req.connection?.remoteAddress ||
          // @ts-expect-error
          req.connection?.socket?.remoteAddress ||
          req.socket?.remoteAddress ||
          // @ts-expect-error
          req.info?.remoteAddress
        );
      },
    }),
  );
};

function get_origin(headers: IncomingHttpHeaders) {
  const protocol = (protocol_header && headers[protocol_header]) || "https";
  const host = (host_header && headers[host_header]) || headers["host"];
  const port = port_header && headers[port_header];

  return port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
}

export const init = () =>
  server.init({
    env: process.env as Record<string, string>,
  });

export const app = polka()
  .use(
    sirv("/client", {
      setHeaders: (res, pathname) => {
        // only apply to build directory, not e.g. version.json
        if (
          res.statusCode === 200 &&
          pathname.startsWith(`/${manifest.appPath}/immutable/`)
        ) {
          res.setHeader("cache-control", "public,max-age=31536000,immutable");
        }
      },
    }),
  )
  .use(serve_prerendered())
  .use(ssr);
