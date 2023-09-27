import { setTimeout } from "node:timers/promises";

/** @return {Array<string|null>} */
function getStack() {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  try {
    Error.prepareStackTrace = (_, traces) =>
      traces.map((trace) => trace.getFunctionName());
    return new Error().stack;
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
}

const PREFIX = "*scope=";
const scope = (suffix, callback) =>
  ({
    async [PREFIX + suffix]() {
      return await callback();
    },
  })[PREFIX + suffix];

const getScope = () =>
  getStack()
    .find((fn) => fn?.startsWith(PREFIX))
    ?.slice(PREFIX.length);

const log = (...args) => {
  console.log(`[${getScope()}]`, ...args);
};

const doThing = async () => {
  log("Job A");
  await setTimeout(1000);
  log("Job B");
  await setTimeout(1000);
  log("Done");
};

const doManyThings = async () => {
  const first = scope("first", doThing);
  const second = scope("second", doThing);
  await Promise.all([first(), second()]);
};

await doManyThings();
