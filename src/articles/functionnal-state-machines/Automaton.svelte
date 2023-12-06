<script lang="ts">
  let color = $state("");
  let label = $state("");

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

  interface Automaton {
    state: string;
    states: Record<string, { enter: () => void; next: string }>;
  }

  let automaton: Automaton = {
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
      red: { enter: red, next: "blue" },
      blue: { enter: blue, next: "gold" },
    },
  };

  const next = ({ state, states }: Automaton) => {
    const { next } = states[state];
    const { enter } = states[next];
    enter();
    return { state: next, states };
  };

  gold();

  const click = () => {
    automaton = next(automaton);
  };
</script>

<div style:background-color={color}>
  <button onclick={click}>{label}</button>
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
