<div class="tldr-block">
  <div class="tldr" title="Too long, did not read">TLDR</div>
  <div class="content">
    <slot />
  </div>
</div>

<style lang="scss">
  .tldr-block {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .tldr {
    padding-right: 0.5rem;
    font-size: 2em;
    font-weight: lighter;
    border-right: 2px solid currentcolor;
    opacity: 0.5;
  }

  .content {
    flex: 1;
  }
</style>
