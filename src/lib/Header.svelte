<div class="wrapper">
  <header>
    <h1>
      <a href="/" data-sveltekit-preload-code="eager">
        <img src="/favicon.svg" alt="🧔🏻‍♂️" width="72" height="72" />
        gautier.dev
      </a>
    </h1>
  </header>
  <slot />
</div>

<style lang="scss">
  header {
    position: relative;
    z-index: 1;
    padding: 0 0.5em;
    contain: paint;
  }

  h1 {
    max-width: var(--main-width);
    margin: 1rem auto;
    font-size: 3em;
    text-align: center;
    text-wrap: balance;
  }

  a {
    all: revert;
    display: inline-flex;
    gap: 1rem;
    align-items: center;
    padding-right: 0.75em;
    vertical-align: bottom;
    color: inherit;
    text-decoration: none;
    background-image: linear-gradient(#000, #000);
    background-repeat: no-repeat;
    background-position: right;
    background-size: 0 100%;
    border-radius: 0.75em;
    transition:
      150ms color,
      150ms background-size;

    &:hover,
    &:active,
    &:focus-visible {
      color: var(--bg, #fff);
      outline: none;
      background-position: left;
      background-size: 100% 100%;
    }
  }

  img {
    width: 1.5em;
    height: 1.5em;
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 50%;
  }

  header,
  .wrapper:has(header + :global(*)) {
    box-shadow: 0 0 0.5em #0002;
  }
</style>
