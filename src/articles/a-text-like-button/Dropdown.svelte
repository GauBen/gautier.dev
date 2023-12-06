<script lang="ts">
  let { open, style } = $props<{ open: boolean; style?: string }>();
  let dropdown = $state<HTMLElement>();

  const preventDefault = (event: Event) => {
    event.preventDefault();
  };
</script>

<svelte:window
  onclick={() => {
    open = false;
  }}
  onfocusin={({ target }) => {
    open = Boolean(dropdown?.contains(target as Node));
  }}
/>

<div class="wrapper">
  <button
    type="button"
    {style}
    onclick={(event) => {
      event.stopPropagation();
      open = !open;
    }}
  >
    Gautier ▼
  </button>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    bind:this={dropdown}
    class="dropdown"
    style:display={open ? "block" : "none"}
    onclick={(event) => {
      event.stopPropagation();
    }}
  >
    <a href="/" onclick={preventDefault}>Gautier</a>
    <a href="/" onclick={preventDefault}>Antoine</a>
    <a href="/" onclick={preventDefault}>Simon</a>
  </div>
</div>

<style lang="scss">
  .wrapper {
    position: relative;
  }

  .dropdown {
    position: absolute;
    padding: 1em;
    background-color: white;
    border-radius: 0.25em;
    box-shadow: 0 0 0.5em #ccc;

    a {
      display: block;
    }
  }
</style>
