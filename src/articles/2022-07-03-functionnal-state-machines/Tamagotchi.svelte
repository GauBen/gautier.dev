<script lang="ts">
  import type { Action } from "svelte/action";
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
      enter: () => sleep(5000).then(click("wakeUp")),
      next: { wakeUp: "hungry" },
    },
    running: {
      enter: () => sleep(3500).then(click("done")),
      next: { done: "hungry" },
    },
    eating: {
      enter: () => sleep(2000).then(click("done")),
      next: { done: "happy" },
    },
  } as const;
  let automaton = $state<Automaton<keyof typeof states>>({
    state: "happy",
    states,
  });

  const next = <T extends string>(
    { state, states }: Automaton<T>,
    transition: string,
  ) => {
    const nextState = states[state].next[transition];
    if (!nextState) throw new Error(`Can't ${transition} when ${state}`);
    states[nextState].enter?.();
    return { state: nextState, states };
  };

  let logs = $state<string[]>([]);
  const click = (transition: string) => () => {
    const { state } = automaton;
    try {
      automaton = next(automaton, transition);
      logs.push(`${state} → ${automaton.state}`);
    } catch (error) {
      logs.push((error as Error).message);
    }
  };

  const animations = {
    happy: { row: 0, frames: [0, 1, 2, 3, 4, 5], mspf: 250 },
    hungry: { row: 1, frames: [0, 1, 2, 3, 4, 5], mspf: 250 },
    sleeping: {
      row: 3,
      frames: [0, ...Array.from({ length: 38 }, () => 3), 0],
      mspf: 125,
    },
    running: { row: 2, frames: [0, 1, 2, 3, 4, 5, 6, 7], mspf: 125 },
    eating: { row: 4, frames: [0, 1], mspf: 125 },
  };
  const dest = [32, 32, -32, -32, 64, 64] as const;

  let squirrel = $state<HTMLImageElement>();
  $effect(() => {
    const img = new Image();
    img.src = squirrelSrc;
    img.onload = () => (squirrel = img);
  });

  let zzz = $state<HTMLImageElement>();
  $effect(() => {
    const img = new Image();
    img.src = zzzSrc;
    img.onload = () => (zzz = img);
  });

  let canvas = $state<HTMLCanvasElement>();
  const ctx = $derived(canvas?.getContext("2d"));
  $effect(() => {
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, canvas.width / 2, canvas.height / 2);
    ctx.imageSmoothingEnabled = false;

    const start = performance.now();
    let animationFrame: number;
    const play = () => {
      if (!ctx || !squirrel || !zzz) return;
      ctx.clearRect(-width / 2, -height / 2, width, height);

      const t = performance.now() - start;
      const { frames, mspf, row } = animations[automaton.state];
      const sprite = frames[Math.floor(t / mspf) % frames.length];
      ctx.drawImage(squirrel, sprite * 32, row * 32, ...dest);

      if (automaton.state === "sleeping" && sprite === 3)
        ctx.drawImage(zzz, (Math.floor(t / 250) % 4) * 32, 0, ...dest);

      animationFrame = requestAnimationFrame(play);
    };
    play();
    return () => cancelAnimationFrame(animationFrame);
  });

  const scrollToBottom: Action<HTMLElement, unknown> = (node) => {
    node.scrollTop = node.scrollHeight;
    return { update: () => (node.scrollTop = node.scrollHeight) };
  };
</script>

<section>
  <div class="device">
    <canvas bind:this={canvas}></canvas>
    <button onclick={click("eat")} title="Eat">🌰</button>
    <button onclick={click("sleep")} title="Sleep">💤</button>
    <button onclick={click("run")} title="Run">👟</button>
  </div>
  <div class="logs">
    <h3>Logs</h3>
    <pre use:scrollToBottom={logs.length}>{logs.slice(-10).join("\n")}</pre>
  </div>
</section>

<footer>
  <a href="https://elthen.itch.io/2d-pixel-art-squirrel-sprites">
    Squirrel Art by Elthen
  </a>
</footer>

<style lang="scss">
  section {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  h3,
  pre {
    margin: 0;
  }

  canvas {
    grid-area: screen;
    width: 100%;
    height: 6rem;
    background-color: #fff;
    border-radius: 1rem;
    box-shadow: 0 0.125rem 0.25rem #0004 inset;
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

    font-size: 0.8em;
    text-align: center;
  }

  .device {
    display: grid;
    grid-template:
      "screen screen screen"
      "eat sleep run" / 1fr 1fr 1fr;
    gap: 1rem;
    width: 10rem;
    padding: 1rem;
    background: linear-gradient(to bottom, #f0bd30 60%, #ca1c1c);
    border-radius: 2rem;
    box-shadow: 0 0.125rem 0.25rem #0004;
  }

  .logs {
    flex: 1;
    flex-basis: 20rem;
    max-width: 100%;

    pre {
      height: 8rem;
    }
  }
</style>
