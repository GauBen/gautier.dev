---
title: Hello World!
---

<script>
  import Hello from './Hello.svelte'
  let checked
</script>

## This is my first article!

This seems to be a great start

<Hello name="World" bind:checked />

<p>{#if checked}Youpi!{/if}</p>
