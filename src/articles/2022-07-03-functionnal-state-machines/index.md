---
title: Functional State Machines
description: A functional approach to state machines in JavaScript.
snippet:
  lang: ts
  code: |
    interface Automaton {
      state: string
      states: Record<string, {
        enter: () => void
        next: string
      }>
    }
---

<script>
  import Automaton from './Automaton.svelte';
  import Tamagotchi from './Tamagotchi.svelte';
  import Mermaid from '$lib/Mermaid.svelte';
</script>

Finite state machines, sometimes simply automatons, are a mathematical model of computation. They are used to describe the behavior of systems, and are often used in computer science to model programs.

I spent a lot of times thinking about automatons because they have an inherent elegance that I admire. This article describes a functional approach to state machines in JavaScript, but you might also be interested in [an imperative approach](./imperative-state-machines).

## Finite-State Automatons

To begin with, let's try to create a simple application that follows this automaton:

<Mermaid>
  graph LR
    A((1))
    B((2))
    C((3))
    A --> B --> C --> A
    style A fill:gold,stroke:black,color:black
    style B fill:firebrick,stroke:black,color:white
    style C fill:navy,stroke:black,color:white
</Mermaid>

There are three **states** (1, 2 and 3), and three **transitions** (1 → 2, 2 → 3, 3 → 1).

The states can be represented as a set of functions, one for each state:

```ts
let color: string;
let label: string;

const gold = () => {
  color = "gold";
  label = "Magic ✨";
};
const red = () => {
  color = "firebrick";
  label = "Magic 🚒";
};
const blue = () => {
  color = "navy";
  label = "Magic 🚓";
};

// Set color and label to the initial state
gold();
```

For the transitions, we will take a declarative approach and use a data structure to describe them:

```ts
const automaton = {
  // Initial state
  state: "gold",
  states: {
    // Describe each state
    gold: {
      // Refer to the `gold` function defined above
      enter: gold,
      // The next state to transition to
      next: "red",
    },
    red: {
      enter: red,
      next: "blue",
    },
    blue: {
      enter: blue,
      next: "gold",
    },
  },
};
```

How do we run this automaton? We need a function that takes an automaton and returns a new automaton. (Note that we are not mutating the automaton, but returning a new one, which is a functional approach.)

```ts
const next = (automaton) => {
  // Get the current state
  const state = automaton.states[automaton.state];

  // Run the next state's `enter` function
  const nextState = automaton.states[state.next];
  nextState.enter();

  // Return a new automaton with the next state
  return {
    state: state.next,
    states: automaton.states,
  };
};
```

And that's all we need for the automaton to run! We can now run our `next` function in a click handler, and this is what we get:

<Automaton />

## More complex automatons

We started with a simple automaton model that only allows for a single transition between states. We will extends this model to allow for more complex transitions, based on user input.

Let's build a simple Tamagotchi! Because I am not very aware of what Tamagotchis do, I will make up a simple model: the Tamagotchi can be happy, hungry, or doing an activity (sleeping, running or eating). The user has three buttons to have the Tamagotchi start an activity, but the Tamagotchi might refuse to do the activity if it is not in the right state.

<Mermaid>
  graph LR
    happy([Happy])
    sleeping([Sleeping])
    running([Running])
    hungry([Hungry])
    eating([Eating])
    happy --> |sleep| sleeping --> |<em>5 s</em>| hungry
    happy --> |run| running --> |<em>3 s</em>| hungry
    hungry --> |eat| eating --> |<em>2 s</em>| happy
    style happy fill:yellow,stroke:black,color:black
    style sleeping fill:skyblue,stroke:black,color:black
    style running fill:purple,stroke:black,color:white
    style hungry fill:crimson,stroke:black,color:white
    style eating fill:pink,stroke:black,color:black
</Mermaid>

This diagram is the automaton of our Tamagotchi: it features all the possible states, as well as the user actions that can trigger a transition. The activities automatically end after a certain amount of time.

To represent the several possible transitions from a single state, we need to replace `next: "state"` with a slightly more complex structure:

```ts
const automaton = {
  state: "happy",
  states: {
    happy: {
      enter: happy,
      // Enumerate all the possible next states
      next: {
        // transition: nextState
        sleep: "sleeping",
        run: "running",
      },
    },
    // ...
  },
};
```

<Tamagotchi />
