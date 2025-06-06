---
title: Formgator, my new validation library
description: Discover the motivation and the development process that led to formgator, a  validation library for forms.
snippet:
  lang: ts
  code: |
    const schema = fg.form({
      title: fg.text({ required: true, maxlength: 255 }),
      picture: fg.file({ accept: ["image/*"] }),
      draft: fg.checkbox(),
    });
---

I released a validation library a few days ago, and I'm pleased with the turn of events. Its name is [formgator](https://github.com/GauBen/formgator), like an alligator that guards your forms. _I'm working on a full zoo of libraries, and this is the first one._

This article is not a tutorial, you should [check the documentation](https://github.com/GauBen/formgator) if that's what you're looking for. Instead, I'll talk about the motivation behind formgator and the development process.

## Quick introduction

Formgator is a validation library, and there are already plenty out there. **Why build a new one?**

I'm currently building a [social calendar](https://github.com/GauBen/timeline) as a side project with my most productive stack: [SvelteKit](https://kit.svelte.dev/). (By the way, when was the last time you had a framework so great, your stack didn't have a "+" sign in it?) SvelteKit takes to heart the idea of using **web standards** instead of building abstractions on top of them; and in the case of forms, that means [processing them as `FormData` objects](https://kit.svelte.dev/docs/web-standards#formdata).

That is a deal breaker for most validation libraries, which expect plain objects. I also wanted to have a validation library that **mirrors HTML form inputs and validation attributes** (e.g. `<input type="date" required>`) so that the learning curve is minimal.

_Enters formgator._

It has a validator per `<input>` type, they take the same attributes as the input element, and you can compose them to create a form schema. **If you know HTML you already know how to use formgator.** I also took special care in outputting proper TypeScript types, so you get the best of both worlds: a simple API and type safety.

```ts
import * as fg from "formgator";

// Create a form schema with common fg.<type> validators
const schema = fg.form({
  title: fg.text({ required: true, maxlength: 255 }),
  picture: fg.file({ accept: ["image/*"] }),
  draft: fg.checkbox(),
});

const result = schema.parse(formData);

// result has this shape:
// {
//   title: string,
//   picture: File | null,
//   draft: boolean,
// }
```

`formData` can be either a [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object or a [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object, in practice allowing validation of both GET and POST requests.

If you want to a more in-depth explanation of formgator, [check out the documentation](https://github.com/GauBen/formgator).

## Functional API

[Zod](https://zod.dev/) is my favorite validation library, hands down. It's pure bliss to use, especially for complex schemas, so I wanted to offer a similar experience with formgator. At the heart of both zod and formgator is the idea of **pure, side-effect-free functions**. For instance, when declaring a number input with additional constraints, you can chain methods to refine the value:

```ts
fg.number({ required: true })
  .refine((value) => value % 10 !== 0, "Must not be a multiple of 10")
  .transform(BigInt);
```

There are no mutations performed at any point. All methods return a new validator, so you can reuse them as you wish. This allows for a very predictable and easy-to-debug behavior.

I implemented this behavior with a new approach to me: _functional object-oriented programming_. ~~I'm not sure if that's a thing, but it's how I would describe it.~~ The term seems to exist, so I'm not that loony after all. The idea is to have **methods on plain objects instead of classes**, and have all methods return new objects instead of mutating the current one.

Let's create a small example to illustrate this, a `number()` validator that can apply transformations:

```ts
const schema = number()
  .transform((x) => x + 1)
  .transform((x) => x * 2);
schema.parse(1); // 4
schema.parse(2); // 6
```

The `number` function returns an object with a `transform` and a `parse` method. The `transform` method returns a new object with the same methods, but with a new `parse` method that applies the transformation. This way, you can chain transformations.

The implementation is as follows:

```ts
// Our "constructor" function
function number() {
  // Return a new schema object with its two methods
  return {
    // Dummy parse method, return the value as is
    parse: (value) => value,
    // The transform method, declared below
    transform,
  };
}

// The transform method
function transform(fn) {
  // In this scope, `this` refers to the schema object
  return {
    // Make a copy of the current object
    ...this,
    // Replace the parse method with a new one that applies the transformation
    parse: (value) => fn(this.parse(value)),
  };
}
```

Am I crazy for thinking this is leaner than traditional classes? **Functional soundness paired with the elegance of object-oriented chaining.** I'll die on this hill.

## A modern Node project

This project being written in pure TypeScript, I wanted to try new development tools. Instead of using the traditional ESLint+Prettier combo, **I went with [Biome](https://biomejs.dev/)**, falling for the promise of a single dependency for all my linting and formatting needs. If you don't need plugins, it's a great choice: it's fast and works out of the box.

Running TypeScript in Node is a breeze thanks to the awesome [tsx](https://tsx.is/). Drop all other TypeScript runners, this is the one you need.

Modern versions of Node finally ship with [a test runner](https://nodejs.org/docs/latest/api/test.html#running-tests-from-the-command-line) and [a code coverage reporter](https://nodejs.org/docs/latest/api/test.html#collecting-code-coverage)! We've been waiting for ages to get these tools bundled with Node, and now they're here. I'm glad to see the **Node team focusing on a stronger standard library**. They are a bit rough around the edges, but they work well enough for formgator. If you're starting a new project, I'd recommend giving them a try.

Packaging and versioning is rendered painless with [pkgroll](https://github.com/privatenumber/pkgroll) and [Changesets](https://github.com/changesets/changesets): pkgroll produces the distribution files, and Changesets pushes them to npm. While the setup is [not as straightforward as I'd like](https://github.com/changesets/action/pull/402), it's a one-time thing and it's worth it for the peace of mind.

All in all the development experience is good with fewer dependencies than what we were used to in the past. I'm pleased to see the ecosystem moving in this direction.

## Launch

Formgator is designed to fit perfectly with SvelteKit, with [a specific adapter to alleviate boilerplate](https://github.com/GauBen/formgator#usage-with-sveltekit), so I shared it on the Svelte Discord server. [Paolo Ricciuti](https://github.com/paoloricciuti), Svelte maintainer and host of [This Week in Svelte](https://www.youtube.com/playlist?list=PL8bMgX1kyZTiLCyvf8vF13sdnR4fhNl6v), invited me to present it on the show. I was thrilled to have the opportunity to talk about formgator, and I think the episode turned out great. You can watch it below:

<figure>
<iframe width="800" height="450" style="aspect-ratio: 16/9" src="https://www.youtube.com/embed/SHBxjWtlv4A?si=noq3QHEnBiMFapEb&start=1665" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</figure>

Thank you Paolo for the opportunity and your kind words. The community has been very welcoming, and I'm grateful for that.
