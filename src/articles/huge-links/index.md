---
title: Huge Links
description: A guide on how to create element-level links.
date: 2022-05-24
snippet:
  lang: css
  code: |
    .card {
      position: relative;
    }
    .card a::before {
      content: '';
      position: absolute;
      inset: 0;
    }
hydrate: true
---

<script>
  import Example from '$lib/Example.svelte'
  import Table from '$lib/markdown/table.svelte'
</script>

<style>
  .card {
    max-width: 300px;
    box-shadow: 0 .25em .5em #ccc;
    border-radius: .5em;
    overflow: hidden;
  }

  .img {
    height: 100px;
    background: linear-gradient(to right, tomato, purple);
  }

  .card-body {
    padding: 1em;
    display: flex;
  }

  .p1::before {
    content: 'Hey!';
  }

  .p2::before {
    content: 'Hey!';
    position: absolute;
    top: 0;
    left: 0;
    outline: 2px solid white;
  }

  .p3::before {
    position: absolute;
    content: '';
    inset: 0;
  }
</style>

We often need to make entire elements clickable, for instance cards or table rows. There are a lot of ways to do it, but some of them are better than others in terms of accessibility.

Let's consider that we want to make the following card clickable:

```svelte
<Card>
  <img src="hotel.jpg" alt="Nice hotel" />
  <a href="/book">Book now!</a>
</Card>
```

I'm using a Svelte/React/Vue-like syntax here, but we'd write it `<div class="card">` if we were using Bootstrap.

<Example>
  <div class="card">
    <div class="img" />
    <div class="card-body" style:justify-content="right">
      <a href="/book" on:click|preventDefault>Book now!</a>
    </div>
  </div>
</Example>

Right now, while the link is clickable, its _hitbox_ is way too small. We want to make the whole card clickable. To achieve this effect, many solutions are possible:

- Make the element clickable with JavaScript.
- Wrap the whole element in a `<a>` tag.
- Use pseudo-elements to make the link _hitbox_ bigger.

## Using pseudo-elements

Pseudo-elements are a powerful CSS feature: they allow creating HTML-like elements out of nothing. These elements can then be positioned and interactive, like all other elements.

We'll create a pseudo element on our card link, and since it'll be a child of the link, it'll be clickable too.

```scss
.card a::before {
  content: 'Hey!';
}
```

<Example>
  <div class="card">
    <div class="img" />
    <div class="card-body" style:justify-content="right">
      <a href="/book" class="p1" on:click|preventDefault>Book now!</a>
    </div>
  </div>
</Example>

That works great, the pseudo-element behaves like it is a direct text-node of the link. The only thing that betrays its nature is the fact that it cannot be selected.

Now, let's try positioning it.

```scss
.card {
  position: relative;
}

.card a::before {
  position: absolute;
  top: 0;
  left: 0;
  content: 'Hey!';
  outline: 2px solid white;
}
```

<Example>
  <div class="card" style="position:relative">
    <div class="img" />
    <div class="card-body" style:justify-content="right">
      <a href="/book" class="p2" on:click|preventDefault>Book now!</a>
    </div>
  </div>
</Example>

I added `position: relative` to `.card` to make it the link's positioning ancestor. Indeed, when using `position: absolute` or `fixed`, the element you're positioning is placed, not relative to the page, but relative to its closest positioned ancestor. If I hadn't positioned the card, the element would be in the top left corner of the page.

When hovered, the pseudo-element triggers its parent animation, and it can be clicked too.

## Filling the whole space

There is a shorthand property that means the same as `top/bottom/left/right: 0`: it's `inset: 0`. This leads to the following code:

```css
.card {
  position: relative;
}

.card a::before {
  content: '';
  position: absolute;
  inset: 0;
}
```

<Example>
  <div class="card" style="position:relative">
    <div class="img" />
    <div class="card-body" style:justify-content="right">
      <a href="/book" class="p3" on:click|preventDefault>Book now!</a>
    </div>
  </div>
</Example>

Our card is now fully-clickable, and the link animation triggers when the card is hovered.
