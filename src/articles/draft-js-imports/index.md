---
title: All possible JavaScript imports
description: There are so many of them, it's definitely confusing. Let's list them all, and see what they do.
snippet:
  lang: js
  code: |
    import React, {useState, useEffect} from 'react';
    import * as React from 'react';
    import React = require('react');
    // ...?
---

<script>
  import {Tldr, Callout} from '$lib/markdown';
</script>

<Tldr>

Here is the story of JavaScript imports. It may not be 100% accurate but it should give you an idea of what is going on.

</Tldr>

```ts
import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import { type JSX } from "react";
import * as React from "react";
import React = require("react");
const React = await import("react");
// ...!
```

And the list can go on longer. If it confuses you, rest assured, you are far from alone. In this article, I'll try to explain both the why and the how of all these import statements.

Take a drink, it _will_ be a long road.

<Callout>

Code samples in this article do not reflect best practices, but are meant to give you an idea of what was done in the past. Please don't take them as gospel.

</Callout>

## Why the mess?

### The origins: `<script>` tags

Let's go back in time and ask ourselves "How did we get here?"

There was a time when JavaScript was a simple, browser-bound, scripting language. Its only purpose was to sprinkle a bit of interactivity ✨ on webpages.

```html
<script>
  // Will show an alert if the form is not filled
  function validate() {
    var email = document.getElementsByName("email")[0].value;
    if (email == "") {
      alert("Please fill in both fields");
      return false;
    }
  }
</script>

<form method="POST" action="/register.do">
  <label>Email: <input type="text" name="email" /></label>
  <button onclick="return validate()">Submit</button>
</form>
```

I should have added a [`<table>` layout](https://thehistoryoftheweb.com/tables-layout-absurd/) for nostalgia, but I digress.

Somehow, people were bored of doing the same thing over and over again<sup>[_citation needed_]</sup> and started turning themselves to reusable bits of JavaScript, usually called **libraries**. The most famous one is probably jQuery, born in 2006, but there were a lot of them. ([JS fatigue](https://news.ycombinator.com/item?id=10796567) ain't new, folks.)

How do you include a library in your page? You add a `<script>` tag, and you're done.

```html
<script src="/path/to/jquery.min.js"></script>
<script>
  $("#button").on("click", function () {
    $("#toggle").toggle();
  });
</script>
```

This `$` variable comes from `jquery.min.js`, but how does it work exactly? It leverages the fact that all scripts in a webpage share the same global scope, named `window`. (It means that `$ === window.$`.) In practice, here is what jQuery---and all libs for that matter---does:

```html
<script>
  // jquery.min.js
  (function (window) {
    // Internal utilities
    var internalObject = {};
    function internalFunction() {}

    // Register the `$` variable in the global scope
    window.$ = function (selector) {
      // `internalFunction` and `internalObject` can be accessed here
    };
  })(window);
</script>

<script>
  // Your script only sees the `$` variable
  $("#button").doSomething();
  // window.$ would work too

  // `internalFunction` or `internalObject` are not accessible here
  // because declared in a closure (a function scope)
</script>
```

While this works for basic cases, this mechanism---registering libraries to the global scope---will break down in bigger projects, where you might have several libraries or even several versions of the same library, as some names are reused.

### The rise of modules: Node.js

In 2009, a guy named [Ryan Dahl](https://github.com/ry) thought it was a great idea to run JavaScript outside of the browser and make it a general-purpose programming language. Let's not discuss the sanity of this decision, but it gave birth to Node.js. And no programming language is complete without a package manager (looking at you C 👀), so npm was born a year later, in 2010.

Since there are no `<script>` tags in Node.js---you run JS directly, not HTML---you need a way to include other files. **This is where the `require` function comes in.**

`require` is a global Node.js function that has the power to import a relative JS file if it starts with `./` or import from a `node_modules` folder if it doesn't. To abide by the [principle of encapsulation](<https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)>), Node.js offers a file-scoped `module` variable to declare the exposed API.

Here an example using both `require` and `module.exports`, with both relative and `node_modules` imports:

```js
// ./node_modules/pad-right/index.js
// Expose a function that pads a string with whitespaces
module.exports = function pad(str, len) {
  while (str.length < len) {
    str = str + " ";
  }
  return str;
};

// ./books.js
// Expose an array of books
module.exports = [
  { title: "Journey to the Center of the Earth", year: 1864 },
  { name: "Gilded Needles", year: 1980 },
  { name: "The Housemaid", year: 2022 },
];

// ./index.js
var pad = require("pad-right"); // Import from node_modules
var books = require("./books"); // Relative import

console.log("*** My favorite books ***");
for (var i = 0; i < books.length; i++) {
  console.log(pad(books[i].title, 34), "|", books[i].year);
}
```

This code will print:

```
*** My favorite books ***
Journey to the Center of the Earth | 1864
Gilded Needles                     | 1980
The Housemaid                      | 2022
```

In this example, the `module.exports` variable is set to a function and an array, and that's what is retrieved when `require` is called. While it can be anything, **usage turned to objects to expose multiple functions and values:**

```js
// ./greet.js
// `module.exports` is `{}` by default, properties can be added to it
module.exports.name = "World";
module.exports.sayHello = function (name) {
  console.log("Hello " + name);
};

// ./index.js
var greet = require("./greet"); // `greet` is an object with methods and properties
greet.sayHello(greet.name);
```

This type of modules is called **[CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules), or CJS for short.** It's the extension that can be used in Node.js to enforce the evaluation of JavaScript file as a CommonJS module.

If you take a second look at the snippets above, you'll notice that the argument of the `require` function does not need an extension. Instead, Node.js uses [a resolution algorithm](https://nodejs.org/api/modules.html#all-together) that can be summed up as follows: if the extension-less file cannot be found, try concatenating `.js` and `/index.js`.

### More mess: TypeScript

JavaScript's more popular flavor, TypeScript, was created in 2012. It adds static typing to the language, and with it, new ways to import and export modules.

Because types do not exist at runtime, TypeScript had to come up with a way to import and export types only. This syntax is completely erased during the transpilation process. There's no reason to use it nowadays, but it's mentioned in this article for the sake of completeness.

```ts
// ./book.ts
interface Book {
  title: string;
  year: number;
}
export = Book;

// ./index.ts
import Book = require("./book");
const book: Book = { title: "The Priory of the Orange Tree", year: 2019 };
```

Do not use that, it's a relic of the past.

In case `export =` is used with a value, it will be transpiled to `module.exports =`.

## Standard modules: ES6

In 2015, the 6th version of the ECMAScript specification was released. (It's ECMAScript and not JavaScript [because JavaScript is trademark](https://tinyclouds.org/trademark), but both languages are one and the same.) With it comes an official, standardized way to declare modules, called **ECMAScript modules, or ESM for short**.

This is the `import` and `export` syntax you know and love! Because this standard was meant to supersede all others, it was made powerful enough to handle all cases, especially the ones from CommonJS.

Also, because it is a standard, it is supported by all modern runtimes: browsers, Node.js, Deno, Bun... ESM puts an end to platform-specific module systems.

### Exporting a single value with `export default`

Let's start exploring the `export` syntax with its simplest form: exporting a single value.

```js
// ./greet.js
export default function greet(name) {
  console.log("Hello " + name);
}

// ./index.js
import greet from "./greet.js"; // Notice the `.js` extension!
greet("World");
```

This is the modern version of `module.exports =`. The only thing worth mentioning is that Node's resolution algorithm does not apply to ESM. You need to specify the extension of the file you're importing.

It works with any value, functions, arrays, primitives, and objects. For instance, you can export an object:

<!-- prettier-ignore -->
```js
// ./config.js
export default {
  host: "localhost",
  port: 3000,
};

// ./index.js
import config from "./config.js";
console.log("Server running on", config.host + ":" + config.port);
```

It is tempting to write `import { host, port } from "./config.js"`, but it won't work; **you cannot destructure a default export**. While it works to export an object as a default export, ESM offers a better, more explicit way to export multiple values.

### Exporting multiple values with `export`

TBC
