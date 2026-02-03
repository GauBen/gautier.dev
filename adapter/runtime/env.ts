import process from "node:process";
import { env_prefix } from "virtual:manifest";

const expected = new Set([
  "SOCKET_PATH",
  "HOST",
  "PORT",
  "ORIGIN",
  "XFF_DEPTH",
  "ADDRESS_HEADER",
  "PROTOCOL_HEADER",
  "HOST_HEADER",
  "PORT_HEADER",
  "BODY_SIZE_LIMIT",
  "SHUTDOWN_TIMEOUT",
  "IDLE_TIMEOUT",
  "KEEP_ALIVE_TIMEOUT",
  "HEADERS_TIMEOUT",
]);

const expected_unprefixed = new Set(["LISTEN_PID", "LISTEN_FDS"]);

if (env_prefix) {
  for (const name in process.env) {
    if (name.startsWith(env_prefix)) {
      const unprefixed = name.slice(env_prefix.length);
      if (!expected.has(unprefixed)) {
        throw new Error(
          `You should change env_prefix (${env_prefix}) to avoid conflicts with existing environment variables — unexpectedly saw ${name}`,
        );
      }
    }
  }
}

export function env(name: string): string | undefined;
export function env<T>(name: string, fallback: T): string | T;
export function env(name: string, fallback?: unknown): unknown {
  const prefix = expected_unprefixed.has(name) ? "" : env_prefix;
  const prefixed = prefix + name;
  return prefixed in process.env ? process.env[prefixed] : fallback;
}

/** Throw a consistently-structured parsing error for environment variables. */
function parsing_error(
  name: string,
  value: unknown,
  description: string,
): never {
  throw new Error(
    `Invalid value for environment variable ${name}: ${JSON.stringify(value)} (${description})`,
  );
}

/** Check the environment for a timeout value (non-negative integer) in seconds. */
export function timeout_env(name: string): number | undefined {
  const raw = env(name);
  if (!raw) return;

  if (!/^\d+$/.test(raw)) {
    parsing_error(name, raw, "should be a non-negative integer");
  }

  const parsed = Number.parseInt(raw, 10);

  // We don't technically need to check `Number.isNaN` because the value already passed the regexp test.
  // However, just in case there's some new codepath introduced somewhere down the line, it's probably good
  // to stick this in here.
  if (Number.isNaN(parsed)) {
    parsing_error(name, raw, "should be a non-negative integer");
  }

  if (parsed < 0) {
    parsing_error(name, raw, "should be a non-negative integer");
  }

  return parsed;
}
