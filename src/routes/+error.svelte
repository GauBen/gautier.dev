<script lang="ts">
  import { page } from '$app/stores'
  import Header from '$lib/Header.svelte'
  import { onMount } from 'svelte'

  $: ({ status, error } = $page)

  let title: HTMLElement

  const velocity = 200
  const angle = Math.random() * Math.PI * 2

  let vx = Math.cos(angle) * velocity
  let vy = Math.sin(angle) * velocity

  let playing = false
  let t = 0
  const play = () => {
    const { scrollWidth, scrollHeight } = document.body
    let { x, y, width, height } = title.getBoundingClientRect()

    const dt = performance.now() - t
    t += dt
    x += (vx * dt) / 1000
    y += (vy * dt) / 1000

    if (x < 0) {
      x = -x
      vx = -vx
    } else if (x + width > scrollWidth) {
      x = 2 * scrollWidth - 2 * width - x
      vx = -vx
    }

    if (y < 0) {
      y = -y
      vy = -vy
    } else if (y + height > scrollHeight) {
      y = 2 * scrollHeight - 2 * height - y
      vy = -vy
    }

    title.style.transform = `translate(${x}px, ${y}px)`

    if (playing) requestAnimationFrame(play)
  }

  onMount(() => {
    playing = true
    t = performance.now()
    play()

    return () => {
      playing = false
    }
  })
</script>

<svelte:head>
  <title>{status} {error?.message}</title>
</svelte:head>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<h1
  bind:this={title}
  on:click={() => {
    vx *= 2
    vy *= 2
  }}
>
  {status}
</h1>

<article>
  <Header />
  <div style="flex: 4" />
  <p style="font-size: 2em">{error?.message}</p>
  <p><a href="/">Go back to homepage</a></p>
  <div style="flex: 5" />
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
  }
</style>
