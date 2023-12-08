---
title: A text-like button
description: Working with default styles without losing accessibility.
snippet:
  lang: css
  code: |
    button {
      all: unset;
      outline: revert;
    }
---

<script>
  import Breadcrumbs from './Breadcrumbs.svelte';
  import Dropdown from './Dropdown.svelte';
  import Item from './Item.svelte';
  import Output from '$lib/Example.svelte';
  import Table from '$lib/markdown/table.svelte';
  import Tldr from '$lib/Tldr.svelte';
</script>

<Tldr>
  Use <code>unset</code> to make it look like text, and <code>revert</code> to bring back the default browser styles.
</Tldr>

I recently had a design challenge: how do I create a dropdown menu in breadcrumbs? This challenge lead me to write an interesting solution whose I'll share here. This article will be focused on the dropdown activator.

## What I wanted to achieve

My dropdown activator needed the following:

- Look like a breadcrumb, followed with a "▼" dropdown icon
- Be keyboard accessible

It turned out that these two requirements were fairly easy to meet, and each corresponds to a single CSS property.

## An ugly button

I wanted my dropdown activator to be a `<button>` because it's _already_ accessible. This element was made to create interactive interfaces, and I did not want to waste time making `<span onclick>` work like a button.

Let's start with "basic" HTML:

```svelte
<Breadcrumbs>
  <Item><a href="/">Inbox</a></Item>
  <Item><button click="showDropdown">Gautier ▼</button></Item>
  <Item>Latest messages</Item>
</Breadcrumbs>
```

I'm using a Svelte/React/Vue syntax here, but you might consider for instance that `<Breadcrumbs>` means `<div class="breadcrumbs">` with pure HTML and Bootstrap.

Here's what it looks like:

<Output>
  <Breadcrumbs>
    <Item><a href="?" on:click|preventDefault>Inbox</a></Item>
    <Item><Dropdown /></Item>
    <Item>Latest messages</Item>
  </Breadcrumbs>
</Output>

While it looks ugly, it behaves exactly as I want it to behave: it's a keyboard accessible button -- you may <kbd>tab</kbd> <kbd>tab</kbd> <kbd>return</kbd> your way into it.

## Make it look like it belongs

We want to make our button looks like its surrounding text. The great news is that [browsers now support](https://caniuse.com/css-all) a way to reset CSS on an element: the `all` property.

This property can take four different values, let's try them all!

```html
<button style="all: ...">Button</button>
```

<Table>
  <tr>
    <th><code>revert</code></th>
    <th><code>initial</code></th>
    <th><code>unset</code></th>
    <th><code>inherit</code></th>
  </tr>
  <tr>
    <td><Output><button style="all: revert">Button</button></Output></td>
    <td><Output><button style="all: initial">Button</button></Output></td>
    <td><Output><button style="all: unset">Button</button></Output></td>
    <td><Output><button style="all: inherit">Button</button></Output></td>
  </tr>
  <tr>
    <td>❌ Brings back the default browser button.</td>
    <td>❌ Brings back the default raw-text browser style.</td>
    <td>✅ Uses the default raw-text style.</td>
    <td>❌ Copies its parent styles (here the <code>{'<Example>'}</code> element).</td>
  </tr>
</Table>

Okay, this looks quite chaotic, but we have found what we wanted: `unset` make our button look like is surrounding text, with the correct font and all. Let's try it on our dropdown activator:

<Output>
  <Breadcrumbs>
    <Item><a href="?" on:click|preventDefault>Inbox</a></Item>
    <Item><Dropdown css="all: unset" /></Item>
    <Item>Latest messages</Item>
  </Breadcrumbs>
</Output>

It looks great now! There is however an issue that is hard to notice: it is not keyboard accessible anymore. When <kbd>tab</kbd>bing to it, the focus ring is not visible anymore. From there, two possibilities:

- Add a `button:focus` style with some cool focus effects
- Bring the focus ring back

While the first option would perfectly work, I chose...

## Bringing back the focus ring

Indeed, I quite like the default focus ring, and it creates a sense of unity with the link right before the button. Well, we saw earlier that `revert` and `initial` both bring back the default browser style, let's try them both.

```html
<button style="all: unset; outline: ...">Button</button>
```

<Table>
  <tr>
    <th><code>revert</code></th>
    <th><code>initial</code></th>
  </tr>
  <tr>
    <td><Output><button style="all: unset; outline: revert">Button</button></Output></td>
    <td><Output><button style="all: unset; outline: initial">Button</button></Output></td>
  </tr>
  <tr>
    <td>✅ Brings back the default focus ring.</td>
    <td>❌ Raw-text does not have a focus ring.</td>
  </tr>
</Table>

Sorry mobile users, you will have to trust me on this one. However, if you have a keyboard near your fingers, you may try <kbd>tab</kbd>bing between the buttons.

Here's all the CSS put together:

```css
button {
  all: unset;      /* Makes it look like text */
  outline: revert; /* Brings back the focus ring */
}
```

<Output>
  <Breadcrumbs>
    <Item><a href="?" on:click|preventDefault>Inbox</a></Item>
    <Item><Dropdown css="all: unset; outline: revert" /></Item>
    <Item>Latest messages</Item>
  </Breadcrumbs>
</Output>

We now have a _beautiful_ and accessible dropdown button!
