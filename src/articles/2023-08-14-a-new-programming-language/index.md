---
draft: true
title: Meet Piña, a new programming language
---

<script>
  import Tldr from '$lib/Tldr.svelte'
</script>

<Tldr>I often complain how the programming languages I develop with are badly designed (mostly JavaScript and PHP). Will I be terrible at designing a new language? Yes?</Tldr>

Let's design a new programming language, with the features I want. I learnt a lot of various programming languages, with various features, and I want to create a new one, with the best features of all of them.

1. **Strongly typed.** This is kind of obvious, but I want a strongly typed language. What's great about JavaScript is TypeScript. Writing untyped JavaScript is guaranteed to fail at some scale.

2. **All programming styles should be possible,** but somewhat "enforced", ensuring consistency. Whether you favor functional or imperative programming, the code should feel idiomatic.

Because we need a name for the language, and I like Piña Coladas, let's call it Piña, with `.pina` as the file extension. It does not seem used by anyone at this time of writing.

## A type system

Let's start by designing the type system. It will be inspired by OCaml as it is the best type system I know of.

### Primitive types

The primitive types are:

- `Int8/16/32/64`: signed integers of 8/16/32/64 bits
- `UInt8/16/32/64`: unsigned integers of 8/16/32/64 bits
- `Float32/64`: floating point numbers of 32/64 bits
- `Bool`: boolean
- `String`: UTF-8 string

Nothing fancy here, we might want piña to be able to run on embedded devices, so we need to be able to use integers of various sizes. We probably want to embed big integers at some point, but since I don't intend to create this language for real, let's keep it simple.

Also, we don't want to run in JavaScript `number` mess, so we need to have a clear distinction between integers and floating point numbers.

### Composite types

This is getting interesting. We need to be able to create composite types, and we need to be able to create them recursively. Types should begin with an uppercase letter, and instances should begin with a lowercase letter. The syntax will be a bit like TypeScript's.

```pina
// A record named Vec2
type Vec2 = {
  x Float32
  y Float32
}

const origin = Vec2 { x = 0.0 y = 0.0 }
// Also possible to shorten to `Vec2 { 0.0 0.0 }` if the order is correct

// A shape is a list of points
type Shape = Vec2[]

// A union type named Option
type Option<T> = None | Some T

// It is possible to create recursive types
type List<T> =
  | End
  | Item {
      head T
      tail List<T>
    }

// Type aliases
type Path = List<Vec2>
```

Recursive types would be checked at compile time, so it is not possible to create an infinitely recursive type.

It is not possible to reference a type that has not been declared yet:

```pina
type A = Option<B> // Error: type B is not defined
type B = { a A }
```

```pina
// This will create A only, B will be undefined
type A = Option<B>
  with type B = { a A }

// We can declare B later
type B = { a A }

// Or we can create both at ones
type A = Option<B>
  and type B = { a A }
```

This `with` logic will appear later with value declarations, effectively displaying what we want first and then the implementation.

A powerful type-system should allow natural pattern-matching:

```pina
type Expression =
  | Number Int32
  | Add { left Expression right Expression }
  | Multiply { left Expression right Expression }

// Declare an instance function (i.e. method)
function Expression.toString() -> match this with
  | Number n -> n.toString()
  | Add { left right } -> left + " + " + right
  | Multiply { left right } -> left + "×" + right

// If `Add` gets ambiguous, `Expression.Add` can be used
const e = Add {
  left = Number 1
  right = Multiply {
    left = Number 2
    right = Number 3
  }
}

print(e.toString()) // "1 + 2×3"
```

## Functions, procedures and workflows

These concepts are inspired by [Temporal](https://temporal.io/) and [ADA](https://ada-lang.io/).

- A function is a deterministic computation, that returns a value. It has no side effects. It is written as a simple expression.
- A procedure is a computation that has side effects and can leverage the event loop.
- A workflow is a computation that can be interrupted, and resumed later. It cannot have direct side effects, but it can call procedures.

I want the syntax to feel natural for C-like programmers, but with less symbols. Python's syntax is also a good inspiration. Also, I want to get rid of positional arguments, and use key-value arguments instead.

```pina
const add = function (a b) -> a + b
// or
function add(a b) -> a + b

// Let's create a list type
type List<T> =
  | End
  | Item { head T tail List<T> }

// And a function to reduce it
function List.reduce(reducer initialValue) -> match this with
  | End -> initialValue
  | Item { head tail } ->
      tail.reduce(
        reducer
        reducer(initialValue head)
      )

// We can now sum a list of integers
function List<Int32>.sum() -> this.reduce(add 0)

// Let's create a way to prepend an item to a list
function List.prepend(item) -> Item {
  head = item
  tail = this
}

function init(value) -> Item { head = value tail = End }

print(result) // 6
  with result = list.sum()
  with list = init(3).prepend(2).prepend(1)
```

Are records mutable? I'd like to answer no. Let's see if we can still do things with this approach.

```pina
// A simple HTTP server
import { Server } from "std/http"
import { readFile } from "std/files"

procedure respond(request) {
  print(request.url.toString())
  // Native event loop!
  const file = await readFile(request.url.pathname)
  match file with
    | Content content {
      return Direct {
        status = 200
        body = content
      }
    }
    | Error error {
      return Direct {
        status = 500
        body = error.toString()
      }
    }
}

const server = Server {
  port = 8080
  respond = respond
}

server.start()
```

What could the type declarations look like?

```pina
type URL = {
  pathname String
}

function URL.toString() -> this.pathname

type Request = {
  url URL
  method String
  body Stream
}

type Response =
  | Direct { status UInt16 body String }
  | Stream { status UInt16 body Stream }

type Respond = procedure Request returns Response

type Server = {
  port    UInt16
  respond Respond
  socket  Option<Socket>
}

procedure Server.start() -> {
  const port = this.port
  const respond = this.respond

  const socket = createSocket()
  socket.bind(port)
  socket.listen()
  update this = {
    socket = Some socket
  }

  while this.socket <> None {
    const connection = await socket.accept()
    const request = await connection.read()
    const response = await respond(request)
    await connection.write(response)
  }
}

procedure Server.stop = () -> {
  const socket = this.socket
  socket.close()

  update this = {
    socket = None
  }
}
```

This gets complicated quickly, I'm not sure how to design this yet.

```pina
type Signal = Wait | Stop
new Signal() -> Wait
// Only callable on mutable instances
procedure Signal.stop = () {
  update this = Stop
}

let signal = new Signal()
print(signal) // Wait
signal.stop()
print(signal) // Stop
```

```pina
let cont = True
let i = 0
while cont {
  update i += 1
  update cont = i < 10
}
```

```pina
// Count all words in a file
procedure countWords(file) -> {
  const contents = await readFile(file)
  return contents.split(" ").length
}

function String.split(separator) -> match this.find(separator) with
  | None -> [this]
  | Some index ->
    [this.slice(0 index)]
    + this.slice(index + 1).split(separator)

function String.index(substring) -> match this.find(substring) with
  | None -> -1
  | Some index -> index

function Array.slice(start end) -> match (this start) with
  | None -> []
  | Some item -> [item] + this.slice(start + 1 end)
```

```pina
type Player = {
  name String
  health Float32
  damage Float32
}

procedure Player.attack(target) -> {
  print("{this.name} attacks {target.name}"})
  target.health -= this.damage
}

function Player.isAlive() -> this.health > 0.0

let P1 = Player {
  name = "Player 1"
  health = 100.0
  damage = 10.0
}

let P2 = Player { "Player 2" 50.0 10.0 }

while P1.isAlive() and P2.isAlive() {
  P1.attack(P2)
  P2.attack(P1)
}

if P1.isAlive() {
  print("{P1.name} wins!")
} else {
  print("{P2.name} wins!")
}
```
