<script lang="ts">
  type State = Promise<Transition>;
  type Transition = () => State;

  const { words }: { words: string[] } = $props();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  let word = $state("");
  $effect(() => {
    const pick = (index = -1): State => type((index + 1) % words.length, 0);

    const type = async (index: number, length: number): State => {
      await sleep(150);
      word = words[index].slice(0, length + 1);

      if (length + 1 === words[index].length) return () => pause(index);
      else return () => type(index, length + 1);
    };

    const pause = async (index: number): State => {
      await sleep(500);
      return () => erase(index, words[index].length);
    };

    const erase = async (index: number, length: number): State => {
      await sleep(150);
      word = words[index].slice(0, length);

      if (length === 0) return () => pick(index);
      else return () => erase(index, length - 1);
    };

    let running = true;

    const run = async () => {
      let state: State = pick();
      while (running) state = (await state)();
    };

    run();

    return () => {
      running = false;
    };
  });

  let blink = $state(false);
  $effect(() => {
    let on = false;
    const interval = setInterval(() => {
      on = !on;
      blink = on;
    }, 450);
    return () => {
      clearInterval(interval);
    };
  });

  const cursor = $derived(!word || blink ? "|" : "");
</script>

{word}{cursor}
