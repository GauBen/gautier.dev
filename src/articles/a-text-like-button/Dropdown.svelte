<script lang="ts">
  export let open = false
  export let css = ''

  /** Closes the dropdown menu when it loses focus. */
  const focusHandler = ({ target }: FocusEvent) => {
    open = Boolean((target as HTMLElement | null)?.closest('.dropdown'))
  }
</script>

<svelte:window on:click={() => (open = false)} on:focusin={focusHandler} />

<div class="wrapper">
  <button
    type="button"
    on:click|stopPropagation={() => (open = !open)}
    style={css}
  >
    Gautier ▼
  </button>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    style:display={open ? 'block' : 'none'}
    class="dropdown"
    on:click|stopPropagation
  >
    <a href="?" on:click|preventDefault>Gautier</a>
    <a href="?" on:click|preventDefault>Antoine</a>
    <a href="?" on:click|preventDefault>Simon</a>
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
