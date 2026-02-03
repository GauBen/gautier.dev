import { parse as polka_url_parser } from "@polka/url";
import { getRequest, setResponse } from "@sveltejs/kit/node";
import { createServer, IncomingHttpHeaders, IncomingMessage } from "node:http";
import process from "node:process";
import polka, { Middleware } from "polka";
import { env_prefix, manifest, prerendered } from "virtual:manifest";
import { Server } from "virtual:server";
import { env, timeout_env } from "./env.js";
import sirv from "./sirv.js";
import { parse_as_bytes } from "./utils.js";

const path = env("SOCKET_PATH", false);
const host = env("HOST", "0.0.0.0");
const port = env("PORT", !path && "3000");

const shutdown_timeout = parseInt(env("SHUTDOWN_TIMEOUT", "30"));
const idle_timeout = parseInt(env("IDLE_TIMEOUT", "0"));
const listen_pid = parseInt(env("LISTEN_PID", "0"));
const listen_fds = parseInt(env("LISTEN_FDS", "0"));
// https://www.freedesktop.org/software/systemd/man/latest/sd_listen_fds.html
const SD_LISTEN_FDS_START = 3;

if (listen_pid !== 0 && listen_pid !== process.pid) {
  throw new Error(
    `received LISTEN_PID ${listen_pid} but current process id is ${process.pid}`,
  );
}
if (listen_fds > 1) {
  throw new Error(
    `only one socket is allowed for socket activation, but LISTEN_FDS was set to ${listen_fds}`,
  );
}

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

function normalise_header(
  name: string | undefined,
  value: string | string[] | undefined,
) {
  if (!name) return undefined;
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    if (value.length === 1) return value[0];
    throw new Error(
      `Multiple values provided for ${name} header where only one expected: ${value}`,
    );
  }
  return value;
}

function get_origin(headers: IncomingHttpHeaders) {
  const protocol = decodeURIComponent(
    normalise_header(protocol_header, headers[protocol_header]) || "https",
  );

  // this helps us avoid host injections through the protocol header
  if (protocol.includes(":")) {
    throw new Error(
      `The ${protocol_header} header specified ${protocol} which is an invalid because it includes \`:\`. It should only contain the protocol scheme (e.g. \`https\`)`,
    );
  }

  const host =
    normalise_header(host_header, headers[host_header]) ||
    normalise_header("host", headers["host"]);
  if (!host) {
    const header_names = host_header
      ? `${host_header} or host headers`
      : "host header";
    throw new Error(
      `Could not determine host. The request must have a value provided by the ${header_names}`,
    );
  }

  const port = normalise_header(port_header, headers[port_header]);
  if (port && isNaN(+port)) {
    throw new Error(
      `The ${port_header} header specified ${port} which is an invalid port because it is not a number. The value should only contain the port number (e.g. 443)`,
    );
  }

  return port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
}

async function createNodeServer() {
  // Initialize the HTTP server here so that we can set properties before starting to listen.
  // Otherwise, polka delays creating the server until listen() is called. Settings these
  // properties after the server has started listening could lead to race conditions.
  const server = createServer();

  const keep_alive_timeout = timeout_env("KEEP_ALIVE_TIMEOUT");
  if (keep_alive_timeout !== undefined) {
    // Convert the keep-alive timeout from seconds to milliseconds (the unit Node.js expects).
    server.keepAliveTimeout = keep_alive_timeout * 1000;
  }

  const headers_timeout = timeout_env("HEADERS_TIMEOUT");
  if (headers_timeout !== undefined) {
    // Convert the headers timeout from seconds to milliseconds (the unit Node.js expects).
    server.headersTimeout = headers_timeout * 1000;
  }

  const app = new Server(manifest);
  await app.init({ env: process.env as Record<string, string> });

  return polka({ server })
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
    .use(async function ssr(req, res) {
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
        await app.respond(request, {
          platform: { req },
          getClientAddress: () => {
            if (address_header) {
              if (!(address_header in req.headers)) {
                throw new Error(
                  `Address header was specified with ${
                    env_prefix + "ADDRESS_HEADER"
                  }=${address_header} but is absent from request`,
                );
              }

              const value = (req.headers[address_header] as string) || "";

              if (address_header === "x-forwarded-for") {
                const addresses = value.split(",");

                if (xff_depth < 1) {
                  throw new Error(
                    `${env_prefix + "XFF_DEPTH"} must be a positive integer`,
                  );
                }

                if (xff_depth > addresses.length) {
                  throw new Error(
                    `${env_prefix + "XFF_DEPTH"} is ${xff_depth}, but only found ${
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
    });
}

createNodeServer().then((server) => {
  const socket_activation = listen_pid === process.pid && listen_fds === 1;

  if (socket_activation) {
    server.listen({ fd: SD_LISTEN_FDS_START }, () => {
      console.log(`Listening on file descriptor ${SD_LISTEN_FDS_START}`);
    });
  } else {
    server.listen({ path, host, port }, () => {
      console.log(`Listening on ${path || `http://${host}:${port}`}`);
    });
  }

  let shutdown_timeout_id: NodeJS.Timeout | void;
  let idle_timeout_id: NodeJS.Timeout | void;
  function graceful_shutdown(reason: "SIGINT" | "SIGTERM" | "IDLE") {
    if (shutdown_timeout_id) return;

    // If a connection was opened with a keep-alive header close() will wait for the connection to
    // time out rather than close it even if it is not handling any requests, so call this first
    // @ts-expect-error this was added in 18.2.0 but is not reflected in the types
    server.server.closeIdleConnections();

    server.server.close((error) => {
      // occurs if the server is already closed
      if (error) return;

      if (shutdown_timeout_id) clearTimeout(shutdown_timeout_id);
      if (idle_timeout_id) clearTimeout(idle_timeout_id);

      process.emit("sveltekit:shutdown", reason);
    });

    shutdown_timeout_id = setTimeout(
      // @ts-expect-error this was added in 18.2.0 but is not reflected in the types
      () => server.server.closeAllConnections(),
      shutdown_timeout * 1000,
    );
  }

  let requests = 0;
  server.server.on("request", (req: IncomingMessage) => {
    requests++;

    if (socket_activation && idle_timeout_id) {
      idle_timeout_id = clearTimeout(idle_timeout_id);
    }

    req.on("close", () => {
      requests--;

      if (shutdown_timeout_id) {
        // close connections as soon as they become idle, so they don't accept new requests
        // @ts-expect-error this was added in 18.2.0 but is not reflected in the types
        server.server.closeIdleConnections();
      }
      if (requests === 0 && socket_activation && idle_timeout) {
        idle_timeout_id = setTimeout(
          () => graceful_shutdown("IDLE"),
          idle_timeout * 1000,
        );
      }
    });
  });

  process.on("SIGTERM", graceful_shutdown);
  process.on("SIGINT", graceful_shutdown);
});
