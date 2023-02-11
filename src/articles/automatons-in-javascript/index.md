---
title: Automatons in JavaScript
description: Using asynchronous programming to create finite-state automatons in pure JavaScript.
date: 2022-07-03
snippet:
  lang: ts
  code: |
    type State = Promise<Transition>
    type Transition = () => State
hydrate: true
---

<script>
  import { onMount } from 'svelte';
  import Automaton from './Automaton.svelte';
  import Mermaid from '$lib/Mermaid.svelte';
</script>

While building a web app in pure JavaScript, I stumbled upon the following problem: _How do I keep my application in a consistent state?_

By _consistent_, I actually mean, _make sure that all changes of state were attended._

I came up with a fun solution that's worth at least _one_ article on my personal website.

## Finite-State Automatons

Let's start by creating two types mapping two usual concepts:

```ts
type State = Promise<Transition>
type Transition = () => State
```

States lead to transitions, and transitions lead to states, and this already sounds like an automaton. However, **what's interesting is the asynchronous nature of these types.** Therefore, states are promises to transitions, and may take time to resolve. For instance, a state might resolve on a user interaction.

To begin with, let's try to create a simple application that follows this automaton:

<Mermaid>
  graph LR
    A((1))
    B((2))
    C((3))
    A --> B --> C --> B
    style A fill:gold,stroke:black,stroke-width:2px,color:black
    style B fill:firebrick,stroke:black,stroke-width:2px,color:#fff
    style C fill:navy,stroke:black,stroke-width:2px,color:#fff
</Mermaid>

We'll write it in Svelte mostly because I like the language, but everything was designed to run in pure JavaScript.

```svelte
<script lang="ts">
  let color: string
  let label: string

  // Three states
  const gold = () => {
    color = 'gold'
    label = 'Magic ✨'
    return () => red
  }
  const red = () => {
    color = 'firebrick'
    label = 'Magic 🚒'
    return () => blue
  }
  const blue = () => {
    color = 'navy'
    label = 'Magic 🚓'
    return () => red
  }

  // Initial state
  gold()
</script>

<div style:background-color={color}>
  <button>{label}</button>
</div>
```

<Automaton />
