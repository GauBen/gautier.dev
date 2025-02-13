---
title: All possible JavaScript imports
description: There are so many of them, it's definitely a confusing mess. Let's list them all, and see what they do.
snippet:
  lang: js
  code: |
    import React, {useState, useEffect} from 'react';
    import * as React from 'react';
    import React = require('react');
    // ...?
---

<script>
  import {Tldr} from '$lib/markdown';
</script>

<Tldr>

There are so many ways to import JavaScript modules, I can't just give you a simple answer. Let's list them all, and see what they do.

</Tldr>

```ts
import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import { type JSX } from "react";
import * as React from "react";
import React = require("react");
const React = await import("react");
// ...
```

And the list can go on longer. If it confuses you, rest assured, you are far from alone. In this article, I'll try to explain both the why and the how of all these import statements.

Take a drink, it _may_ be a long road.

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

I should have added a `<table>` layout for nostalgia, but I digress.

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
    var internalObject = {
      // ...
    };

    function internalFunction() {
      // ...
    }

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

### The rise of modules: Node.js

In 2009, a guy named [Ryan Dahl](https://github.com/ry) thought it was a great idea to run JavaScript outside of the browser and make it a general-purpose programming language. Let's not discuss the sanity of this decision, but it gave birth to Node.js. And no programming language is complete without a package manager (looking at you C 👀), so npm was born a year later, in 2010.

Since there is no `<script>` tag in Node.js---you run JS directly, not HTML---you need a way to include other files. This is where the `require` function comes in.

`require` is a global Node.js function that has the power to import a relative JS file if it starts with `./` or import from a `node_modules` folder if it doesn't.
