<script lang="ts">
  import { derived, readable } from 'svelte/store'

  type State = Promise<Transition>
  type Transition = () => State

  export let words: string[]

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const word = readable('', (set) => {
    const pick = (index = -1): State => type((index + 1) % words.length, 0)

    const type = async (index: number, length: number): State => {
      await sleep(150)
      set(words[index].slice(0, length + 1))

      if (length + 1 === words[index].length) return () => pause(index)
      else return () => type(index, length + 1)
    }

    const pause = async (index: number): State => {
      await sleep(500)
      return () => erase(index, words[index].length)
    }

    const erase = async (index: number, length: number): State => {
      await sleep(150)
      set(words[index].slice(0, length))

      if (length === 0) return () => pick(index)
      else return () => erase(index, length - 1)
    }

    let running = true

    const run = async () => {
      let state: State = pick()
      while (running) state = (await state)()
    }

    run()

    return () => {
      running = false
    }
  })

  const blink = readable(false, (set) => {
    let on = false
    const interval = setInterval(() => {
      on = !on
      set(on)
    }, 450)
    return () => {
      clearInterval(interval)
    }
  })

  const cursor = derived([word, blink], ([$word, $blink]) => {
    if (!$word || $blink) return '|'
    else return ''
  })
</script>

{$word}{$cursor}
