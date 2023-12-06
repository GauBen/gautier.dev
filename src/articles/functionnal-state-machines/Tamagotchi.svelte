<script lang="ts">
  const sleep = async (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  interface Automaton {
    state: string;
    states: Record<
      string,
      {
        enter?: () => void;
        next: Record<string, string | undefined>;
      }
    >;
  }

  let automaton: Automaton = $state({
    state: "happy",
    states: {
      happy: { next: { sleep: "sleeping", run: "running" } },
      hungry: { next: { eat: "eating" } },
      sleeping: {
        enter: () => {
          void sleep(5000).then(click("wakeUp"));
        },
        next: { wakeUp: "hungry" },
      },
      running: {
        enter: () => {
          void sleep(3000).then(click("done"));
        },
        next: { done: "hungry" },
      },
      eating: {
        enter: () => {
          void sleep(2000).then(click("done"));
        },
        next: { done: "happy" },
      },
    },
  });

  let logs = $state<string[]>([]);

  const next = ({ state, states }: Automaton, transition: string) => {
    const nextState = states[state].next[transition];
    if (!nextState) return { state, states };
    const { enter } = states[nextState];
    enter?.();
    return { state: nextState, states };
  };

  const click = (transition: string) => () => {
    const { state } = automaton;
    automaton = next(automaton, transition);
    logs = [
      ...logs,
      state === automaton.state
        ? `Can't ${transition} when ${state}`
        : `${state} → ${automaton.state}`,
    ];
  };
</script>

<div class="wrapper">
  <div class="device">
    <div class="screen">
      {automaton.state}
    </div>
    <button onclick={click("eat")}>Eat</button>
    <button onclick={click("sleep")}>Sleep</button>
    <button onclick={click("run")}>Run</button>
  </div>
  <div class="logs">
    <h3>Logs</h3>
    {#each logs.slice(-3) as log}
      <div>{log}</div>
    {/each}
  </div>
</div>

<style lang="scss">
  h3 {
    margin: 0;
  }

  .logs {
    flex: 1;
    padding: 1rem 0;
  }

  .wrapper {
    display: flex;
    gap: 1rem;
  }

  .device {
    display: grid;
    grid-template:
      "screen screen screen"
      "eat sleep run" / 1fr 1fr 1fr;
    gap: 1rem;
    width: 12rem;
    padding: 1rem;
    background: linear-gradient(180deg, #f0bd30 60%, #ca1c1c);
    border-radius: 1rem;
  }

  .screen {
    display: flex;
    grid-area: screen;
    align-items: center;
    justify-content: center;
    height: 5rem;
    background-color: #efe;
    outline: 1px solid #ccc;
  }
</style>
