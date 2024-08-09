---
title: Building a real-time chat  in Gleam
snippet:
  lang: gleam
  code: |
    pub fn main() {
      "Hello World!"
      |> io.println
    }
---

<script>
  import Tldr from '$lib/Tldr.svelte'
</script>

<Tldr>

[Gleam](https://gleam.run/) is a an awesome language that can make you productive in no time. The complete absence of mutable state requires thinking a bit differently, but it's a small price to pay for the benefits it brings.

</Tldr>

While I've been [dreaming](./a-new-programming-language) about a new programming language without producing anything meaningful, a British lad going by name [Louis Pilfold](https://github.com/lpil) has been hard at work actually creating one: [Gleam](https://gleam.run/).

I first heard about it around early 2024, when still in v0, thought it looked nice and moved on. Mid-2024, [Exploring Gleam, a type-safe language on the BEAM!](https://christopher.engineering/en/blog/gleam-overview/) made it to the front page of the orange website and I decided to give it a try. The language is intentionally small, and can be learnt in a single afternoon thanks to its short and sweet [language tour](https://tour.gleam.run/).

Here is what I first thought about it:

- **Pro:** static typing
- **Pro:** functional
- **Pro:** messaging built-in
- **Not sure:** complies to Erlang or JavaScript
- **Not sure:** no mutable state
- **Con:** young ecosystem

Regarding the young ecosystem, while it might be an issue for corporate projets depending on the free work of others, it's a non-issue for personal projects: if it does not exist, make it and share it! Gleam comes with a [package manager](https://packages.gleam.run/), a formatter and a language server. That's more than enough to get started. **Young but not immature.**

What about Erlang? I knew very little appart that it was created by Ericsson for telecom purposes and had a weird syntax:

```erlang
Fruits = ["banana", "monkey"].
UppercaseFruits = lists:map(
  fun string:uppercase/1,
  Fruits
).
%% UppercaseFruits is ["BANANA", "MONKEY"]
```

Explicit [arity](https://en.wikipedia.org/wiki/Arity)‽ Digging deeper, I discovered that Erlang runs on a [virtual machine named BEAM](<https://en.wikipedia.org/wiki/BEAM_(Erlang_virtual_machine)>), which is known for its fault-tolerance, high concurrency and native message passing. **And it has native hot swapping capabilities.** I want to hot swap my code without restarting the server! I was sold.

How would you build a stateful app without a mutable global state? More on that later in this article.

## Hello World

A hello world in Gleam is as simple as:

```gleam
import gleam/io

pub fn main() {
  "Hello World!"
  |> io.println
}
```

The `a |> f(...b)` operator is syntactic sugar for `f(a, ...b)`. It allows writing flow-based code without nesting:

```gleam
// Nested code
io.debug(
  int.sum(
    list.filter(
      list.map(
        [1, 2, 3, 4, 5],
        fn(x) { x * x }
      ),
      fn(x) { x % 2 == 0 }
    ),
  ),
) // Prints 20

// Flow-based code
[1, 2, 3, 4, 5]
|> list.map(fn(x) { x * x })
|> list.filter(fn(x) { x % 2 == 0 })
|> int.sum
|> io.debug // Prints 20
```

✨ It looks beautiful, but let's make something more concrete.

## HTTP Hello World
