<header>
  <enhanced:img src="./me.jpg?w=288;144" alt="Me" class="img" />
  <h1>Gautier<br />Ben Aïm</h1>
  <div class="contact">
    <ul>
      <li>
        <span class="i-ph:map-pin-duotone"></span> France
      </li>
      <li>
        <a href="https://gautier.dev">
          <span class="i-ph:link-duotone"></span>
          gautier.dev
        </a>
      </li>
      <li>
        <a href="https://github.com/GauBen">
          <span class="i-ph:github-logo-duotone"></span>
          github.com/GauBen
        </a>
      </li>
      <li>
        <a href="mailto:benaim.gautier@gmail.com">
          <span class="i-ph:envelope-simple-duotone"></span>
          benaim.gautier@gmail.com
        </a>
      </li>
      <li>
        <a href="https://www.linkedin.com/in/gautier-ben-aim/">
          <span class="i-ph:linkedin-logo-duotone"></span>
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

    .img {
      width: 9rem;
      height: 9rem;
      border-radius: 50%;

      @media print {
        display: none;
      }
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
