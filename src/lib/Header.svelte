<div class:shadow={$$slots.default}>
  <header>
    <h1>
      <a href="/" sveltekit:prefetch>
        <img src="/favicon.svg" alt="" aria-hidden="true" /> gautier.dev
      </a>
    </h1>
  </header>
  <slot />
</div>

<style lang="scss">
  header,
  .shadow {
    box-shadow: 0 0 0.5em #ccc;
  }

  header {
    position: relative;
    padding: 0 0.5em;
    overflow: hidden;

    h1 {
      max-width: var(--main-width);
      margin: 1rem auto;
      font-size: 3em;

      a {
        all: revert;
        display: inline-flex;
        gap: 1rem;
        align-items: center;
        color: inherit;
        text-decoration: inherit;
        vertical-align: bottom;
      }

      img {
        height: 1.5em;
        background-color: #fff;
        border: 1px solid #000;
        border-radius: 50%;
      }
    }
  }
</style>
