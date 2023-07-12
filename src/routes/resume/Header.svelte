<script lang="ts">
  import Email from '~icons/ph/envelope-simple-duotone'
  import Github from '~icons/ph/github-logo-duotone'
  import Link from '~icons/ph/link-duotone'
  import Linkedin from '~icons/ph/linkedin-logo-duotone'
  import Pin from '~icons/ph/map-pin-duotone'
  import me from './me.jpg?url'
</script>

<header>
  <img src={me} alt="Me" />
  <h1>Gautier<br />Ben Aïm</h1>
  <div class="contact">
    <ul>
      <li>
        <Pin /> France
      </li>
      <li>
        <a href="https://gautier.dev">
          <Link />
          gautier.dev
        </a>
      </li>
      <li>
        <a href="https://github.com/GauBen">
          <Github />
          github.com/GauBen
        </a>
      </li>
      <li>
        <a href="mailto:benaim.gautier@gmail.com">
          <Email />
          benaim.gautier@gmail.com
        </a>
      </li>
      <li>
        <a href="https://www.linkedin.com/in/gautier-ben-aim/">
          <Linkedin />
          linkedin.com/in/gautier-ben-aim
        </a>
      </li>
    </ul>
  </div>
</header>

<style lang="scss">
  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    align-items: center;
    justify-content: center;

    img {
      width: 9rem;
      height: 9rem;
      border-radius: 50%;
    }

    h1 {
      margin: 0;
      font-size: 3em;
      line-height: 1;
    }
  }

  .contact {
    flex: 1;
    margin-bottom: -0.35em;

    ul {
      display: flex;
      flex-direction: column;
      gap: 0.25em;
      justify-content: end;
      padding: 0;
      margin: 0;
      list-style-type: none;

      li,
      li a {
        display: flex;
        flex-direction: row-reverse;
        gap: 0.5em;
        align-items: center;
        justify-content: end;
      }
    }
  }
</style>
