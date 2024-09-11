---
title: Building a real-time chat in Gleam
description: "Elegant, safe and pragmatic, I have found my favorite language: Gleam. Let's build a real-time chat application with it!"
snippet:
  lang: gleam
  code: |
    http.Post, "/post" -> {
      let message = request.body
      process.send(pubsub, Publish(message))
      new_response(200, "Submitted: " <> message)
    }
---

<script>
  import Tldr from '$lib/Tldr.svelte'
</script>

<Tldr>

[Gleam](https://gleam.run/) is a an awesome language that makes you productive in no time. The absence of mutable state requires thinking a bit out of the box, but it brings many benefits. [View the result on GitHub.](https://github.com/GauBen/real-time-gleam-chat)

</Tldr>

While I've been [dreaming](./a-new-programming-language) about a new programming language that I would never build, a British developer named [Louis Pilfold](https://github.com/lpil) has been hard at work actually creating one: [Gleam](https://gleam.run/).

I first heard about it in early 2024, when it was still in beta, thought it looked nice and moved on. In mid-2024, [Exploring Gleam, a type-safe language on the BEAM!](https://christopher.engineering/en/blog/gleam-overview/), made it to the front page of the orange website, and I decided to give it a try. The intentionally small language can be learned in a single afternoon thanks to its short and sweet [language tour](https://tour.gleam.run/).

Here are my initial thoughts:

- **Pro:** static typing with inference and custom types;
- **Pro:** functional with pattern matching and an elegant syntax;
- **Not sure:** compiles to Erlang or JavaScript;
- **Not sure:** no mutable state;
- **Con:** young ecosystem.

Regarding the young ecosystem, while it may be an issue for corporate projets that depend on the free work of others, it's not a problem for personal projects: if it doesn't exist, make it and share it! Gleam comes with a [package manager](https://packages.gleam.run/), a formatter and a language server. That's more than enough to get started; **young, but not immature.**

What about Erlang? I knew very little about it except that it was created by Ericsson for telecom purposes and had a weird syntax:

```erlang
%% Immutable variables
> Fruits = ["banana","monkey","jungle"].
["banana","monkey","jungle"]

%% Map values using stdlib functions
> lists:map(fun string:uppercase/1, Fruits).
["BANANA","MONKEY","JUNGLE"]

%% Fold over lists using custom functions
> lists:foldl(fun(Str, Cnt) -> string:length(Str) + Cnt end, 0, Fruits).
18
```

Explicit [arity](https://en.wikipedia.org/wiki/Arity)‽ Digging deeper, I discovered that Erlang runs on a [virtual machine named BEAM](<https://en.wikipedia.org/wiki/BEAM_(Erlang_virtual_machine)>), which is known for its fault tolerance, high concurrency, and native message passing. **And it has native hot-swapping capabilities!** I want to hot-swap my code without restarting the server, I'm sold. _I'll write an article about it if I can make it work..._

How would you build a stateful application without a mutable global state? More on that later in this article.

## Hello World

A Hello World in Gleam is as simple as:

```gleam
import gleam/io

pub fn main() {
  "Hello World!"
  |> io.println
}
```

The `a |> f(...b)` pipe operator is syntactic sugar for `f(a, ...b)`. It allows writing pipeline code instead of nesting:

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

// ✨ Pipeline code ✨
[1, 2, 3, 4, 5]
|> list.map(fn(x) { x * x })
|> list.filter(fn(x) { x % 2 == 0 })
|> int.sum
|> io.debug // Prints 20
```

It looks beautiful, but let's make something more concrete.

## HTTP Hello World

Gleam has an [official HTTP library](https://github.com/gleam-lang/http), with standard `Request` and `Response` types, but it is intentionally runtime agnostic. You need an [adapter](https://github.com/gleam-lang/http#server-adapters) to make it work in either Erlang or JavaScript. I picked [Mist](https://hexdocs.pm/mist/), an Erlang adapter, as it seems to be the most popular one.

The `gleam` binary contains the package manager: `gleam add mist` is (almost) all you need to get started.

A Hello World HTTP server in Gleam looks like this:

```gleam
import gleam/bytes_builder
import gleam/erlang/process
import gleam/http/response
import mist

pub fn main() {
  let assert Ok(_) =
    mist.new(
      // Handler function: takes a request and produces a response
      fn(request) {
        let body =
          { "Hello, " <> request.path <> "!" }
          |> bytes_builder.from_string
          |> mist.Bytes
        response.new(200) |> response.set_body(body)
      },
    )
    |> mist.port(3000)
    |> mist.start_http

  // The server starts in a separate process, pause the main process
  process.sleep_forever()
}
```

The principle is simple:

- The `mist.new` function creates a new server handler, which is a function that takes a request and returns a response;
- Under the hood, `mist.start_http` spawns a pool of workers to process incoming requests. The main process is paused with `process.sleep_forever()` to keep the server running.

The thing is, this example is still stateless. (And that's a good thing! _Most_ web applications should be stateless, instead relying on a database to store state.) But to get a better grasp of how Gleam is suited for complex applications, let's try to build something real-time. And real-time means stateful. (No, it doesn't, but let's pretend it does.) **Let's build a chat server!**

## Stateful Gleam

All the languages I have learned so far have one way or another of mutating data. Even OCaml, another functional language, has a `ref` type to store a mutable value. But Gleam has no such thing. **Instead, it has a very elegant structure to hold state: [actors](https://hexdocs.pm/gleam_otp/gleam/otp/actor.html).**

An actor is defined by a state and a function that transforms a message into a new state. No side effects needed. For instance, a simple counter actor would look like this:

```gleam
import gleam/erlang/process
import gleam/int
import gleam/io
import gleam/otp/actor

// The two possible messages the actor can receive
type Message {
  Increment // Add 1 to the state
  Reset     // Set the state to 0
}

// The actor loop function
fn loop(message: Message, state: Int) {
  case message {
    Increment -> {
      let new_state = state + 1
      io.println("New state: " <> int.to_string(new_state))
      // Continue the actor with the new state
      actor.continue(new_state)
    }
    Reset -> {
      io.println("Resetting to 0")
      // Continue the actor with a reset state
      actor.continue(0)
    }
  }
}

pub fn main() {
  // Start the actor with an initial state of 0
  let assert Ok(counter) = actor.start(0, loop)
  process.send(counter, Increment) // New state: 1
  process.send(counter, Increment) // New state: 2
  process.send(counter, Reset)     // Resetting to 0
  process.send(counter, Increment) // New state: 1

  // Wait for the actor to process all messages
  process.sleep(100)
}
```

In this example, the initial state is 0 and the function `loop` can receive two messages:

- `Increment`: adds 1 to the state;
- `Reset`: sets the state to 0.

The actor runs in its own [Erlang process](https://www.erlang.org/doc/system/ref_man_processes.html). Since Erlang is designed for _massive_ concurrency, its processes are lightweight concurrency primitives, implemented with very low overhead. To interact with the actor, we send messages to it using [`process.send`](https://hexdocs.pm/gleam_erlang/gleam/erlang/process.html#send). This also means that we have to wait for the actor to process all messages before exiting the program.

## Real-time chat

Mist has [native support](https://hexdocs.pm/mist/1.1.0/mist.html#server_sent_events) for [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events), a simple protocol for one-way communication from a server to a client. It is perfect for a real-time chat application. As a matter of fact, SSE are usually a better choice than WebSockets for simple use cases, as they are easier to implement and some features like reconnection are built in.

`mist.server_sent_events` is a function that starts an event-emitting actor. We will use Erlang messages to forward chat messages between all connected clients. Here is the architecture that we will build:

- When a client gets `/sse`, start a new SSE actor that will forward messages to the client;
- When a client posts to `/post`, send the message to all connected clients;
- Have a [pubsub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) actor that registers SSE actors and forwards messages to them;
- On `/`, serve a simple HTML page with a form to post messages.

The _send the message to all connected clients_ is the part that requires state: to keep the list of all connected clients (in Gleam, `List(Subject)`), we need a mutable state. That's where the pubsub actor comes in:

```gleam
type PubSubMessage {
  /// A new client has connected and wants to receive messages.
  Subscribe(client: Subject(String))
  /// A client has disconnected and should no longer receive messages.
  Unsubscribe(client: Subject(String))
  /// A message to forward to all connected clients.
  Publish(String)
}
```

Our pubsub will be defined by a state, the list of connected clients, and a function that processes messages:

```gleam
fn pubsub_loop(message: PubSubMessage, clients: List(Subject(String))) {
  case message {
    // When the pubsub receives a Subscribe message with a client in it,
    // continue running the actor loop with the client added to the state
    Subscribe(client) -> {
      io.println("➕ Client connected")
      [client, ..clients] |> actor.continue
    }
    // When the pubsub receives a Unsubscribe message with a client in it,
    // produce a new state with the client removed and continue running
    Unsubscribe(client) -> {
      io.println("➖ Client disconnected")
      clients
      |> list.filter(fn(c) { c != client })
      |> actor.continue
    }
    // Finally, when the pubsub receives a message, forward it to clients
    Publish(message) -> {
      io.println("💬 " <> message)
      clients |> list.each(process.send(_, message))
      clients |> actor.continue
    }
  }
}
```

There are three possible messages:

- `Subscribe`: adds a client to the list;
- `Unsubscribe`: removes a client from the list;
- `Publish`: forwards a message to all clients.

Here is what posting a message to `/post` roughly looks like:

```gleam
http.Post, "/post" -> {
  // Read the request body
  let message = request.body

  // Send the message to the pubsub
  process.send(pubsub, Publish(message))

  // Respond with a success message
  new_response(200, "Submitted: " <> message)
}
```

Posting a message to `/post` sends the message to the pubsub actor, which forwards it to all connected clients. It then responds with a success message. I left out a lot of the implementation details, you can find [the full code on GitHub](https://github.com/GauBen/real-time-gleam-chat/blob/main/src/real_time_chat.gleam#L85-L107).

Subscribing to `/sse` will start a new SSE actor that will receive messages from the pubsub actor and forward them to the web browser:

```gleam
http.Get, "/sse" ->
  mist.server_sent_events(
    request,
    response.new(200),
    // Initialization function of the SSE loop
    init: fn() {
      // Create a new subject for the client to receive messages
      let client = process.new_subject()

      // Send this new client to the pubsub
      process.send(pubsub, Subscribe(client))

      // ... a bit more initialization code
    },
    // This loop function is called every time the `client` subject
    // defined above receives a message.
    // The first parameter is the incoming message, the second is the
    // SSE connection, and the third is the loop state, which, in this
    // case is always the client subject.
    loop: fn(message, connection, client) {
      // Forward the message to the web client
      mist.send_event(
        connection,
        message |> string_builder.from_string |> mist.event,
      )

      // ... a pinch of error handling code
    },
  )
```

Finally, the `/` route serves a simple HTML page with a form for posting messages:

```gleam
http.Get, "/" -> {
  let index = simplifile.read("src/index.html")
  new_response(200, index)
}
```

Said HTML page looks roughly like this:

```html
<div id="messages">
  <!-- Messages go here -->
</div>

<form action="/post" method="post">
  <input type="text" name="message" />
  <button type="submit">Send</button>
</form>

<script>
  // Open a connection to the SSE endpoint
  const messages = document.querySelector("#messages");
  const source = new EventSource("/sse");
  source.onmessage = (event) => {
    // When a message is received, insert it at the end
    messages.append(event.data);
  };

  // Handle form submission client-side
  const form = document.querySelector("form");
  form.onsubmit = async (event) => {
    // Send the message to the POST endpoint
    const body = new FormData(form).get("message");
    await fetch("/post", { method: "POST", body });
  };
</script>
```

SSE are natively supported by all browsers through the [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) object: a decent client can be implemented in literally a single line of JavaScript. The `onmessage` event is fired every time the server sends a message, and the `append` method adds it to the DOM. Sending a message is done by sending a POST request to the `/post` endpoint, and that's it! Since Gleam compiles to JavaScript, we could have tried to write the client in Gleam as well, but this article is already long enough. 👀

<figure>
<enhanced:img src="./screenshot.png?w=1600;800" alt="Screenshot of the resulting frontend: title bar, two messages and an input field" />
<figcaption>I made a frontend in Gleam colors to go with our server.</figcaption>
</figure>

And that, dear reader who made it this far, is how you build a real-time chat application in Gleam! You can find [the full code on GitHub](https://github.com/GauBen/real-time-gleam-chat), with a few additional features I did not cover in this article. I hope you enjoyed this journey as much as I did. Gleam is a beautiful language that I will definitely be using in the future. I hope you will too!
