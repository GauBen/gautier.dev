---
title: JS for advanced developers
description: Common mistakes even advanced JS developers make, mostly because JS is a giant mess.
snippet:
  lang: js
  code: |
    try {
      fetch("https://example.com").then((response) => {
        console.log(response.ok);
      });
    } catch (error) {
      console.error(error); // Never called!
    }
---

<script>
  import {Tldr, Mermaid} from '$lib/markdown';
</script>

<Tldr>

This is not a normal, linear article, but rather a compilation of common mistakes I see when reviewing JavaScript code. I've seen many advanced developers make those mistakes, not because they are bad, but because JS is a giant footgun that also happens to be a programming language.

</Tldr>

"0 days since last bug because JS is a mess" says the sign.

## Working with promises

**Promises are a powerful JavaScript primitive:** they hold a value that is yet to be determined, or an error that has not yet been thrown. As with all powerful tools, they can be misused, and JavaScript is not helping with that.

### Catching errors

A promise called _resolved_ when its value is available, _rejected_ when an error is thrown, and _pending_ otherwise. To process these values, you have two possible ways:

- An imperative way:

  ```js
  try {
    const response = await fetch("https://example.com");
    //               ^^^^^ await unwraps the promise to get the value
    const text = await response.text();
    console.log("Received", text.length, "characters");
  } catch (error) {
    // If the promise was rejected, unwrapping will throw the error
    console.error("Request failed", error);
  }
  ```

- A functionnal way:

  ```js
  fetch("https://example.com")
    .then((response) => response.text())
    // ^ The `.then()` callback is called upon success
    // If a callback returns a promise, `.then()` calls can be chained
    .then((text) => {
      console.log("Received", text.length, "characters");
    })
    .catch((error) => {
      // The callback of the `.catch()` method is called upon failure
      console.error("Request failed", error);
    });
  ```

These two ways work fine and work roughly the same. But if you happen to mix the two, your code will not behave as expected.

```js
// Do not do this!
try {
  fetch("https://example.com")
    .then((response) => response.text())
    .then((text) => {
      console.log("Received", text.length, "characters");
    });
} catch (error) {
  // This will never be called
  console.error(error);
}
```

In this sample, if an error is thrown by `fetch`, it will not be caught by the catch block. Why? **Because `fetch` does not throw an error, it returns a promise that can be rejected.** A rejected promise is turned into an exception when unwrapped (with the `await` keyword). If not, it's just a `Promise` object waiting to be handled.

<figure>
<Mermaid>
graph TD
  pending(["Pending"]) --> resolved(["Resolved"])
  pending --> rejected(["Rejected"])
  style pending fill:lightgrey,stroke:black,color:black
  style resolved fill:lightgreen,stroke:black,color:black
  style rejected fill:firebrick,stroke:black,color:white
</Mermaid>
<figcaption>All three possible promise states</figcaption>
</figure>

The same thing would happen if you do this:

```js
// This code:
try {
  setTimeout(() => {
    // This function runs in an asynchronous context,
    // and is disconnected from its surrounding try/catch
    throw new Error("!!!");
  }, 500);
} catch {
  console.error("???");
}

// Will execute roughly like this:
try {
  setTimeout(fn, 500);
} catch {
  console.error("???");
}
// ⏳
// 500ms later...
// ⌛
(function fn() {
  // No try/catch here
  throw new Error("!!!");
})();
```

To properly handle a `Promise` object, either use `try { await promise } catch { ... }` (imperative way) or `promise.catch(...)` (functionnal way). A promise that is not properly handled is commonly named a [**floating promise**](https://typescript-eslint.io/rules/no-floating-promises/), and ESLint may help you with that.
