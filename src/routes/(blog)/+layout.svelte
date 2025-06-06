<slot />

<footer>
  <p>
    Gautier Ben Aïm — {new Date().getFullYear()} —
    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license">
      CC BY-NC-SA 4.0
    </a>
  </p>
  <p class="icons">
    <a href="https://n7webring.neocities.org/gautier/prev" rel="ugc">
      <span class="i-ph:caret-left">Previous website in the webring</span>
    </a>
    <a href="https://www.linkedin.com/in/gautier-ben-aim/" rel="author">
      <span class="i-ph:linkedin-logo-duotone">My LinkedIn Profile</span>
    </a>
    <a href="https://github.com/GauBen/" rel="author">
      <span class="i-ph:github-logo-duotone">My GitHub Profile</span>
    </a>
    <a href="/feed" rel="feed">
      <span class="i-ph:rss-duotone">Atom feed</span>
    </a>
    <a href="https://n7webring.neocities.org/gautier/next" rel="ugc">
      <span class="i-ph:caret-right">Next website in the webring</span>
    </a>
  </p>
</footer>

<style lang="scss">
  footer {
    max-width: var(--main-width);
    padding: 0 0.5em;
    margin: 0 auto;
    contain: paint;
    text-align: center;
    text-wrap: balance;
  }

  .icons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-block: 1rem;
    font-size: 1.2em;
    line-height: 1;

    a {
      all: revert;
      padding: 0.25rem;
      color: inherit;
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
        outline: none;
        background-position: left;
        background-size: 100% 100%;
      }
    }
  }
</style>
