<script lang="ts">
  import Github from "~icons/ph/github-logo";
  import Linkedin from "~icons/ph/linkedin-logo";
  import Rss from "~icons/ph/rss";
</script>

<slot />

<footer>
  <p>
    Gautier Ben Aïm — {new Date().getFullYear()} —
    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
      CC BY-NC-SA 4.0
    </a>
  </p>
  <p class="icons">
    <a
      href="https://www.linkedin.com/in/gautier-ben-aim/"
      title="My LinkedIn Profile"
    >
      <Linkedin aria-label="LinkedIn" />
    </a>
    <a href="https://github.com/GauBen/" title="My GitHub Profile">
      <Github aria-label="GitHub" />
    </a>
    <a href="/feed" title="Atom feed">
      <Rss aria-label="Atom" />
    </a>
  </p>
</footer>

<style lang="scss">
  footer {
    max-width: var(--main-width);
    padding: 0 0.5em;
    margin: 0 auto;
    overflow: hidden;
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
      align-items: center;
      padding: 0.25rem;
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
    }
  }
</style>
