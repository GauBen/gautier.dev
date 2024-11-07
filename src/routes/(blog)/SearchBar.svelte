<script lang="ts">
  import { goto } from "$app/navigation";
  import { slide } from "svelte/transition";
  import MagnifyingGlass from "~icons/ph/magnifying-glass-bold";
  import X from "~icons/ph/x-bold";

  const { q, autocomplete = [] }: { q?: string; autocomplete?: string[] } =
    $props();

  let input = $state<HTMLInputElement>();
  let focus = $state(false);
  let index = $state<number>();

  const onkeydown = async (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        // On arrow down, show the datalist and select the next option
        event.preventDefault();
        index =
          index === undefined
            ? 0
            : Math.min(index + 1, autocomplete.length - 1);
        break;
      }
      case "ArrowUp": {
        // On arrow up, select the previous option
        event.preventDefault();
        if (index !== undefined) index = Math.max(index - 1, 0);
        break;
      }
      case "Enter": {
        // On enter, pick the selected option and hide the datalist
        if (index !== undefined) {
          event.preventDefault();
          await set(q + autocomplete[index]);
        }
        break;
      }
      case "Escape": {
        if (input?.value) input.blur();
        else await toggle();
      }
    }
  };

  const toggle = async () => {
    await goto(q === undefined ? "?q=" : ".", {
      keepFocus: true,
      noScroll: true,
    });
    input?.focus();
    index = undefined;
  };
  const set = async (value: string) => {
    await goto(`?q=${encodeURIComponent(value)}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true,
    });
    input?.focus();
    index = undefined;
  };
</script>

<div>
  <h2>
    {#if q === undefined}
      Latest articles
    {:else}
      <label for="search">Search</label>
    {/if}
  </h2>
  <button
    class="ghost"
    onclick={toggle}
    aria-label="{q === undefined ? 'Open' : 'Close'} search input"
  >
    {#if q === undefined}
      <MagnifyingGlass aria-label="Magnifying glass icon " />
    {:else}
      <X aria-label="Close icon" />
    {/if}
  </button>
  {#if q !== undefined}
    <form
      class:focus
      onfocusin={() => (focus = true)}
      onfocusout={({ relatedTarget, currentTarget }) => {
        focus = currentTarget.contains(relatedTarget as Node);
      }}
    >
      <input
        name="q"
        value={q}
        id="search"
        {onkeydown}
        type="search"
        maxlength="100"
        bind:this={input}
        autocomplete="off"
        transition:slide={{ duration: 150 }}
        oninput={({ currentTarget }) => set(currentTarget.value)}
      />
      {#if autocomplete.length > 0 && focus}
        <ul class="autocomplete" transition:slide={{ duration: 150 }}>
          {#each autocomplete as suggestion, i (suggestion)}
            <li>
              <button
                type="button"
                tabindex="-1"
                aria-current={index === i}
                onfocus={() => (index = i)}
                onmouseover={() => (index = i)}
                onmousedown={() => set(q + suggestion)}
              >
                {q}<strong>{suggestion}</strong>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </form>
  {/if}
</div>

<style lang="scss">
  div {
    display: grid;
    grid-template: auto auto / 1fr auto;
    align-items: center;
    margin-block: 2rem 1rem;

    > * {
      margin: 0;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    grid-column: 1 / -1;
    border-radius: 0.5em;

    input {
      padding: 0.5em;
      border: 0;
      border-radius: 0.5em;
      box-shadow: 0 0 0.5em #0002;

      &:focus {
        outline: none;
      }
    }

    ul {
      margin: 0;
    }

    &:focus-within {
      box-shadow: 0 0 0.5em #0002;
    }
  }

  .ghost {
    all: unset;
    position: relative;
    align-items: center;
    padding: 0.25rem;
    line-height: 1;
    color: inherit;
    text-decoration: none;
    vertical-align: bottom;
    background-image: linear-gradient(#000, #000);
    background-repeat: no-repeat;
    background-position: right;
    background-size: 0 100%;
    border-radius: 1rem;
    transition:
      150ms color,
      150ms background-size;

    &:hover,
    &:active,
    &:focus-visible {
      color: var(--bg, #fff);
      background-position: left;
      background-size: 100% 100%;
      outline: none;
    }

    // Give the button a bigger hitbox for mobile users
    &::before {
      position: absolute;
      inset: 0 -0.5em;
      content: "";
    }
  }

  .autocomplete {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem;
    list-style: none;

    li {
      display: flex;
    }

    button {
      all: unset;
      flex: 1;
      padding: 0.25rem;
      text-align: left;
      cursor: default;
      border-radius: 0.25rem;
      transition: 150ms background;

      &[aria-current="true"] {
        background: #0002;
      }
    }
  }
</style>
