---
title: Don't write dead code
---

What you are about to read seems like the most obvious piece of advice ever, yet I see it happening all the time.

## What is dead code?

When you think about dead code, you might just think about dead code branches:

```js
function doSomething() {
  service.foo();

  if (false) {
    service.bar(); // <- Dead code
  }

  return service.baz();
}
```

I'm talking about more than that.

- Dead attributes
- Dead files
- Dead infrastructure
- Dead tests
- Dead types
- No UI is better than UI
