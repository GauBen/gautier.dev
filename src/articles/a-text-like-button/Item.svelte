<slot />
<div class="separator" aria-hidden="true" />

<style lang="scss">
  .separator {
    width: 0.1em;
    height: 1em;
    background-color: grey;
    transform: skewX(-20deg);
  }

  .separator:last-of-type {
    display: none;
  }
</style>
