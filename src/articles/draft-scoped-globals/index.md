---
title: "Scoped globals"
---

I've always wondered how some loggers were able to add traces next to the logs despite being imported as globals and not scoped to the function.

```ts
import { logger } from "./logger.js";

app.get("/", (req, res) => {
  logger.log("Received request for /");
  res.sendStatus(200, "Hello World!").end();
  logger.log("Response sent");
});
```

This would output something like this if we have several parallel requests:

```
[541fa53e6fe9091d] Received request for /
[cd4002f927c0490d] Received request for /
[541fa53e6fe9091d] Response sent
[cd4002f927c0490d] Response sent
```

How does `logger.log` work? What's happening behind the scenes?

The are many ways to implement such a thing.

For instance, we can attach an id to the stack trace.

With this naive implementation, we lose track of the scope after the first async call:

```js
import { setTimeout } from "node:timers/promises";

/** @returns {(string | null)[]} */
function getStack() {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  try {
    Error.prepareStackTrace = (_, callsites) =>
      callsites.map((callsite) => callsite.getFunctionName());
    return new Error().stack;
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
}

const PREFIX = "*scope=";
const scope = (suffix, callback) => {
  const name = PREFIX + suffix;
  return {
    [name]() {
      return callback();
    },
  }[name];
};
const getScope = () =>
  getStack()
    .find((callsite) => callsite?.startsWith(PREFIX))
    ?.slice(PREFIX.length);

const log = (...args) => {
  console.log(`[%s] %s`, getScope(), ...args);
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
// [first] Job A
// [second] Job A
// [undefined] Job B
// [undefined] Job B
// [undefined] Done
// [undefined] Done
```

The trick is to force the entire scoped function to run within the named callback:

```js
const scope = (suffix, callback) => {
  const name = PREFIX + suffix;
  return {
    async [name]() {
      return await callback();
      //     ^^^^^ Wait for the function to complete
    },
  }[name];
};
```

There is also a native Node.js package named `async_hooks`.
