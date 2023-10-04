<div>
  <slot />
</div>

<style lang="scss">
  div :global(p) {
    display: flex;
    gap: 0.5em;
    align-items: center;
    margin-block: 0.25em;

    &::before {
      width: 0.25rem;
      height: 0.25rem;
      margin: 0.5rem;
      content: "";
      background: #0d3c77;
      border-radius: 50%;
      outline: 2px solid #0d3c77;
      outline-offset: 0.375rem;
    }
  }

  div :global(ul) {
    margin-block: 0.25em;
    margin-left: 0.5625rem;
    border-left: 2px solid #0d3c77;
  }
</style>
