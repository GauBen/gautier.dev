---
title: Hello World!
date: 2022-05-11
snippet:
  code: |
    let rec fib n = match n with
      | 1 -> 1
      | _ -> n * (fib (n - 1))
  lang: ocaml
hydrate: true
---

<script>
  import Hello from './Hello.svelte'
  let checked
</script>

## This is my first article!

This seems to be a great start

<Hello name="World" bind:checked />

<p>{#if checked}Youpi!{/if}</p>

```ocaml
let rec fib n = match n with
  | 1 -> 1
  | _ -> n * (fib (n - 1))
```

```ruby
# Output "I love Ruby"
say = "I love Ruby"
puts say

# Output "I *LOVE* RUBY"
say['love'] = "*love*"
puts say.upcase

# Output "I *love* Ruby"
# five times
5.times { puts say }
```
