<script lang="ts">
  import squirrelSrc from "./squirrel.png";
  import zzzSrc from "./zzz.png";

  const sleep = async (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  interface Automaton<T extends string> {
    state: T;
    states: Record<
      T,
      {
        enter?: () => void;
        next: Record<string, T | undefined>;
      }
    >;
  }

  const states = {
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
        void sleep(3500).then(click("done"));
      },
      next: { done: "hungry" },
    },
    eating: {
      enter: () => {
        void sleep(2000).then(click("done"));
      },
      next: { done: "happy" },
    },
  } as const;
  let automaton: Automaton<keyof typeof states> = $state({
    state: "happy",
    states,
  });

  let logs = $state<string[]>([]);

  const next = <T extends string>(
    { state, states }: Automaton<T>,
    transition: string,
  ) => {
    const nextState = states[state].next[transition];
    if (!nextState) throw new Error(`Can't ${transition} when ${state}`);
    const { enter } = states[nextState];
    enter?.();
    return { state: nextState, states };
  };

  const click = (transition: string) => () => {
    const { state } = automaton;
    try {
      automaton = next(automaton, transition);

      logs = [...logs, `${state} → ${automaton.state}`];
    } catch (error) {
      logs = [...logs, (error as Error).message];
    }
  };

  let canvas = $state<HTMLCanvasElement>();
  const ctx = $derived(canvas?.getContext("2d"));

  let squirrel = $state<HTMLImageElement>();
  $effect(() => {
    const img = new Image();
    img.src = squirrelSrc;
    img.onload = () => {
      squirrel = img;
    };
  });
  let zzz = $state<HTMLImageElement>();
  $effect(() => {
    const img = new Image();
    img.src = zzzSrc;
    img.onload = () => {
      zzz = img;
    };
  });

  let start = $state(performance.now());
  $effect(() => {
    automaton;
    start = performance.now();
  });

  const animations = {
    happy: { row: 0, frames: [0, 1, 2, 3, 4, 5], mspf: 250 },
    hungry: { row: 1, frames: [0, 1, 2, 3, 4, 5], mspf: 250 },
    sleeping: {
      row: 3,
      frames: [0, 1, 2, ...Array.from({ length: 36 }, () => 3), 0],
      mspf: 125,
    },
    running: { row: 2, frames: [0, 1, 2, 3, 4, 5, 6, 7], mspf: 125 },
    eating: { row: 4, frames: [0, 1], mspf: 125 },
  };
  const dest = [32, 32, 32, 0, 64, 64] as const;

  $effect(() => {
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;

    const play = () => {
      if (!ctx || !squirrel || !zzz) return;
      ctx.clearRect(0, 0, width, height);
      const frame = Math.floor(
        (performance.now() - start) / animations[automaton.state].mspf,
      );
      const sprite =
        animations[automaton.state].frames[
          frame % animations[automaton.state].frames.length
        ];
      ctx.drawImage(
        squirrel,
        sprite * 32,
        animations[automaton.state].row * 32,
        ...dest,
      );
      if (automaton.state === "sleeping" && sprite === 3) {
        ctx.drawImage(
          zzz,
          (Math.floor((performance.now() - start) / 250) % 4) * 32,
          0,
          ...dest,
        );
      }
      request = requestAnimationFrame(play);
    };
    let request = requestAnimationFrame(play);
    play();
    return () => cancelAnimationFrame(request);
  });
</script>

<div class="wrapper">
  <div class="device">
    <canvas bind:this={canvas}></canvas>
    <button onclick={click("eat")} title="Eat">🌰</button>
    <button onclick={click("sleep")} title="Sleep">💤</button>
    <button onclick={click("run")} title="Run">👟</button>
  </div>
  <div class="logs">
    <h3>Logs</h3>
    {#each logs.slice(-3) as log}
      <div>{log}</div>
    {/each}
  </div>

  <footer>
    <a href="https://elthen.itch.io/2d-pixel-art-squirrel-sprites">
      Squirrel Art by Elthen
    </a>
  </footer>
</div>

<style lang="scss">
  h3 {
    margin: 0;
  }

  canvas {
    grid-area: screen;
    width: 100%;
    height: 5rem;
    background-color: #fff;
    border-radius: 1rem;
    box-shadow: 0 0.125rem 0.25rem #0004;
  }

  button {
    height: 2rem;
    padding: 0;
    color: #fff;
    background: #fff;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0.125rem 0.25rem #0004;

    &:hover,
    &:focus-visible {
      background: #ccc;
    }
  }

  footer {
    --link: #888;

    align-self: flex-end;
    font-size: 0.8em;
  }

  .logs {
    flex: 1;
    padding: 1rem 0;
  }

  .wrapper {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .device {
    display: grid;
    grid-template:
      "screen screen screen"
      "eat sleep run" / 1fr 1fr 1fr;
    gap: 1rem;
    width: 10rem;
    padding: 1rem;
    background: linear-gradient(180deg, #f0bd30 60%, #ca1c1c);
    border-radius: 2rem;
    box-shadow: 0 0.125rem 0.25rem #0004;
  }
</style>
