<section>
  <h2>Summary</h2>
  <div>
    <h3>Developer Advocate</h3>
    I architect and promote products tailored for developers, with a strong commitment
    to modern standards, pragmatic solutions and security best practices. I have a
    4+ years IT industry background developing and maintaining software applications
    at scale, with a proven track record of leading successful migrations, increasing
    productivity and satisfaction for my teams.
    <strong hidden>
      I am seeking a challenging role in a fast-paced environment where I can
      leverage my technical and leadership skills to make a significant impact.
    </strong>
  </div>
</section>

<style lang="scss">
  section {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1em;
  }

  h2 {
    margin: 0;
    color: #0d3c77;
    text-align: center;
    text-wrap: balance;

    @supports (writing-mode: sideways-lr) {
      padding-right: 0.5rem;
      border-right: 2px solid #0d3c77;
      writing-mode: sideways-lr;
    }

    // Write the other way and rotate it
    @supports not (writing-mode: sideways-lr) {
      padding-left: 0.5rem;
      border-left: 2px solid #0d3c77;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
  }

  div {
    align-self: center;
  }

  h3 {
    all: unset;
    display: block;
    font-size: 1.25em;
    color: #0d3c77;
    text-transform: uppercase;
  }
</style>
