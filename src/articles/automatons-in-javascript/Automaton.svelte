<script lang="ts">
  // https://gautier.dev/fr/blog/2021-05-12-des-automates-en-javascript/#un-automate-%C3%A0-%C3%A9tat
  let color: string
  let label: string

  const gold = () => {
    color = 'gold'
    label = 'Magic ✨'
  }
  const red = () => {
    color = 'firebrick'
    label = 'Magic 🚒'
  }
  const blue = () => {
    color = 'navy'
    label = 'Magic 🚓'
  }

  const automate = <T extends string, U extends T>({
    state,
    states,
  }: {
    state: U
    states: Record<
      T,
      {
        enter: () => void
        on: Record<string, U | undefined>
      }
    >
  }) => {
    states[state].enter()
    return {
      state,
      states,
      next(event: string) {
        const nextState = states[state].on[event]
        if (!nextState) return this
        return automate({ state: nextState, states })
      },
    }
  }

  let automaton = automate({
    state: 'gold',
    states: {
      gold: {
        enter: gold,
        on: { click: 'red' },
      },
      red: {
        enter: red,
        on: { click: 'blue' },
      },
      blue: {
        enter: blue,
        on: { click: 'red' },
      },
    },
  })

  const click = () => {
    automaton = automaton.next('click')
  }
</script>

<div style:background-color={color}>
  <button on:click={click}>{label}</button>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3em 0;
    box-shadow: 0 0 1em #8888 inset;
  }

  button {
    padding: 1em;
  }
</style>
