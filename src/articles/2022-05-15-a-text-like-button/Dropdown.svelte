<script lang="ts">
  import { resolve } from "$app/paths";

  let { open, style }: { open: boolean; style?: string } = $props();
  let dropdown = $state();

  const preventDefault = (event: Event) => {
    event.preventDefault();
  };
</script>

<svelte:window
  onclick={() => {
    open = false;
  }}
  onfocusin={({ target }) => {
    // @ts-expect-error target is not null
    open = Boolean(dropdown?.contains(target));
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
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    bind:this={dropdown}
    class="dropdown"
    style:display={open ? "block" : "none"}
    onclick={(event) => {
      event.stopPropagation();
    }}
  >
    <a href={resolve("/")} onclick={preventDefault}>Gautier</a>
    <a href={resolve("/")} onclick={preventDefault}>Antoine</a>
    <a href={resolve("/")} onclick={preventDefault}>Simon</a>
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
    box-shadow: 0 0 0.5em #0002;

    a {
      display: block;
    }
  }
</style>
