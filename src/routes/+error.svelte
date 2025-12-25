<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import Header from "$lib/Header.svelte";
  import type { Attachment } from "svelte/attachments";

  const velocity = 200;
  const angle = Math.random() * Math.PI * 2;

  let vx = $state(Math.cos(angle) * velocity);
  let vy = $state(Math.sin(angle) * velocity);

  const bounce: Attachment<HTMLElement> = (title) => {
    let t = performance.now() / 1000;
    let frame: number;

    const play = () => {
      const { scrollWidth, scrollHeight } = document.body;
      let { x, y, width, height } = title.getBoundingClientRect();

      const dt = performance.now() / 1000 - t;
      t += dt;
      x += vx * dt;
      y += vy * dt;

      if (x < 0) {
        x = -x;
        vx = -vx;
      } else if (x + width > scrollWidth) {
        x = 2 * scrollWidth - 2 * width - x;
        vx = -vx;
      }

      if (y < 0) {
        y = -y;
        vy = -vy;
      } else if (y + height > scrollHeight) {
        y = 2 * scrollHeight - 2 * height - y;
        vy = -vy;
      }

      title.style.transform = `translate(${x}px, ${y}px)`;

      frame = requestAnimationFrame(play);
    };

    play();

    return () => cancelAnimationFrame(frame);
  };
</script>

<svelte:head>
  <title>{page.status} {page.error?.message} – gautier.dev</title>
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<h1
  {@attach bounce}
  onclick={() => {
    vx *= 2;
    vy *= 2;
  }}
>
  {page.status}
</h1>

<article>
  <Header />
  <div style="flex: 4"></div>
  <p style="font-size: 2em">{page.error?.message}</p>
  <p><a href={resolve("/")}>Go back to homepage</a></p>
  <div style="flex: 5"></div>
</article>

<style lang="scss">
  h1 {
    position: absolute;
    z-index: 10;
    height: 0.7em;
    margin: 0;
    font-size: 10em;
    line-height: 0.8;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background: #000;
    mix-blend-mode: difference;
    transform: translate(calc(50vw - 50%), calc(50vh - 75%));
  }

  article {
    display: flex;
    flex-direction: column;
    gap: 1em;
    min-height: 100vh;
    background: #fff;
  }

  p {
    margin: 0;
    text-align: center;
    text-wrap: balance;
  }
</style>
