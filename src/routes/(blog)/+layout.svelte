<script>
  import { resolve } from "$app/paths";
  import CaretLeft from "@iconify-svelte/ph/caret-left";
  import CaretRight from "@iconify-svelte/ph/caret-right";
  import Github from "@iconify-svelte/ph/github-logo-duotone";
  import Linkedin from "@iconify-svelte/ph/linkedin-logo-duotone";
  import Rss from "@iconify-svelte/ph/rss-duotone";
</script>

<slot />

<footer>
  <p>
    Gautier Ben Aïm (<a href={resolve("/about")}>Who?</a>) — {new Date().getFullYear()}
    —
    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license">
      CC BY-NC-SA 4.0
    </a>
  </p>
  <p class="icons">
    <a href="https://www.linkedin.com/in/gautier-ben-aim/" rel="author">
      <Linkedin class="icon" aria-label="My LinkedIn Profile" />
    </a>
    <a href="https://github.com/GauBen/" rel="author">
      <Github class="icon" aria-label="My GitHub Profile" />
    </a>
    <a href={resolve("/feed")} rel="feed">
      <Rss class="icon" aria-label="Atom feed" />
    </a>
  </p>
  <p id="webring">
    <a href="https://n7webring.neocities.org/gautier/prev" rel="ugc">
      <CaretLeft class="icon" aria-label="Previous website in the n7 webring" />
    </a>
    <a href="https://n7webring.neocities.org/" rel="ugc"> n7 webring </a>
    <a href="https://n7webring.neocities.org/gautier/next" rel="ugc">
      <CaretRight class="icon" aria-label="Next website in the n7 webring" />
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

  #webring {
    display: flex;
    gap: 0.5rem;
    justify-content: center;

    a {
      all: revert;
      font-size: 0.75rem;
      color: #666;
      text-decoration: none;
      transition: 150ms color;

      &:hover,
      &:active,
      &:focus-visible {
        color: #000;
      }

      &:focus-visible {
        outline: 0;
      }
    }
  }
</style>
