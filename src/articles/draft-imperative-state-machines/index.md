---
title: State machines in JavaScript
description: A guide on how to create a robust state machine in JavaScript.
snippet:
  lang: ts
  code: |
    type State = Promise<Transition>
    type Transition = () => State
---

<script>
  import Example from '$lib/Example.svelte'
  import Mermaid from '$lib/Mermaid.svelte'
  import TypeWriter from './TypeWriter.svelte'
</script>

Finite-state automatons (or state machines for short) are a mathematical construct commonly used to describe the behavior of a system. You probably already saw a few represented by diagrams like this one:

<Mermaid>
  graph LR
    A(Start)
    B(State A)
    C(State B)
    D(End)
    A --> B --> C --> B
    C --> D
</Mermaid>

In this article, we'll see how to create a state machine in JavaScript, a new way to write expressive and explicit code.

Let's start by creating two types mapping two usual concepts:

```ts
type State = Promise<Transition>;
type Transition = () => State;
```

States lead to transitions, and transitions lead to states, and this already sounds like an automaton. However, **what's interesting is the asynchronous nature of these types.** Therefore, states are promises to transitions, and may take time to resolve. For instance, a state might resolve on a user interaction.

## Animations in the frontend

<Example>
  Built for <TypeWriter words={['developers', 'designers', 'managers']}/>
</Example>

I recently came across this problem: **how do I create a type-writer effect in Svelte?** I wanted the thing to be robust and maintainable, so I decided to use a state machine to solve it.

Here is the the state diagram of the system:

<Mermaid>
  graph TD
    D(Pick a new word)
    A(Typing)
    B(Pause)
    C(Erasing)
    B --> C --> C --"If the word is erased"--> D
    D --> A --> A --"If the word is complete"--> B
</Mermaid>

## Make it interactive!

Tamagotchi
