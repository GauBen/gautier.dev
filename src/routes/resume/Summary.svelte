<section>
  <h2>Summary</h2>
  <div>
    <h3>Full-Stack Engineer & Cybersecurity Researcher</h3>
    I am a software engineer with 3+ years of experience in the IT industry. I am
    passionate about security and have a proven ability to architect, develop, and
    maintain secure and scalable software applications. I have a proven track record
    of successfully leading migrations that have resulted in increased productivity
    and satisfaction for my teams.
    <strong>
      I am looking for a challenging role in a fast-paced environment where I
      can use both my technical and leadership skills to make a significant
      impact.
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
