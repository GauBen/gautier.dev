<script lang="ts">
  import GraduationCap from "~icons/ph/graduation-cap-duotone";
  import Medal from "~icons/ph/medal-duotone";
  import Suitcase from "~icons/ph/suitcase-simple-duotone";
  import User from "~icons/ph/user-duotone";
  import Header from "./Header.svelte";
  import Summary from "./Summary.svelte";
  import Timeline from "./Timeline.svelte";
</script>

<div class="page">
  <Header />
  <Summary />
  <article>
    <h2><Suitcase /> Work Experience</h2>
    <div class="xp">
      <h3>
        Full-Stack Senior Engineer & Cybersecurity Researcher
        <mark>
          <a href="https://www.linkedin.com/company/escapetech/">
            Escape (YC W23)
          </a>
        </mark>
      </h3>
      <Timeline>
        <p><strong>Senior Engineer</strong></p>
        <ul>
          <li>
            <strong>Manage and train a team of 3 developers,</strong> ensuring communication,
            code quality and deadlines. Foster innovation, independence and healthy
            team dynamics.
          </li>
          <li>
            <strong>Design clear technical guidelines,</strong> promoting consistent
            code structure and streamlined feature development, ensuring all team
            members are aligned and productive.
          </li>
          <li>
            Head
            <strong>several open source side-projects,</strong>
            including the
            <a href="https://escape.tech/academy/">
              API Security Academy, a learning platform for GraphQL security,
            </a>
            and
            <a href="https://github.com/GauBen/svelte-emails">
              svelte-emails, a modern way to build complex transactional emails.
            </a>
          </li>
          <li>
            <a
              href="https://bsidesoslo.no/talks/StateofGraphQLSecurity2023.html"
            >
              Gave a conference talk at <strong>BSides Oslo</strong>
              on the <strong>State of GraphQL Security 2023,</strong> highlighting
              the company’s year of research.
            </a>
          </li>
          <li>
            <strong>Pioneer the adoption of new technologies</strong> such as SvelteKit,
            Temporal and Turbo to enhance developer productivity and product stability.
          </li>
        </ul>

        <p><strong>Full-Stack Engineer</strong></p>
        <ul>
          <li>
            Demonstrated resilience and perseverance in the
            <strong>Y Combinator accelerator program,</strong>
            shipping several sophisticated products that exceeded customer expectations.
          </li>
          <li>
            <a href="https://escape.tech/blog/author/gautier/">
              <strong>Published technical articles</strong> on the corporate blog,
              ensuring high-quality, informative, and engaging content.
            </a>
          </li>
          <li>
            <strong>
              Successfully managed the migration of the GraphQL API
            </strong>
            from NestJS to Pothos and the frontend from Nuxt to SvelteKit, for improved
            performance and scalability.
          </li>
        </ul>

        <p><strong>Full-Stack Developer & Research Intern</strong></p>
        <ul>
          <li>
            <a
              href="https://escape.tech/blog/forging-graphql-bombs-the-2022-version-of-zip-bombs/"
            >
              <strong>Discovered GraphQL bombs,</strong> a novel attack vector against
              GraphQL APIs.
            </a>
          </li>
          <li>
            Initiated the <strong>creation of a design system</strong> to create
            a single source of truth for all design elements.
          </li>
        </ul>
      </Timeline>

      <div class="stuff">
        <span class="tags">
          <span>Senior Dev</span>
          <span>Management</span>
          <span>Cybersec</span>
          <span>Research</span>
        </span>
        <em>Started in March 2022</em>
      </div>
    </div>

    <div class="xp">
      <h3>
        Full-Stack Developer & Cryptography Advisor Intern
        <mark>
          <a href="https://www.linkedin.com/company/freemindtronic-sl/">
            Freemindtronic
          </a>
        </mark>
      </h3>
      <ul>
        <li>
          <a href="https://github.com/Freemindtronic/evicypher-webmail">
            Developed a browser extension that provides
            <strong>secure end-to-end email encryption</strong> leveraging NFC cards
            as a cold storage device for private keys.
          </a>
        </li>
        <li>
          <a href="https://github.com/Freemindtronic/keyserver">
            Designed and implemented an OpenPGP HTTP keyserver that meets the
            <strong>
              specific security and compliance needs of government agencies.
            </strong>
          </a>
        </li>
        <li>
          Architected a backup system based on Shamir’s Secret Sharing to
          <strong>achieve information-theoretic security.</strong>
        </li>
        <li>
          <strong>Onboarded and mentored interns</strong> to ensure a smooth transition
          of responsibilities, with hands-on experience and training.
        </li>
      </ul>
      <div class="stuff">
        <span class="tags">
          <span>Cybersec</span>
          <span>Development</span>
          <span>Cryptography</span>
        </span>
        <em>June to August 2021</em>
      </div>
    </div>

    <div class="xp">
      <h3>
        Web Developer Student Consultant
        <mark>
          <a href="https://www.linkedin.com/company/n7-consulting/">
            N7 Consulting
          </a>
        </mark>
      </h3>
      <ul>
        <li>
          Reimagined the Junior Enterprise's website to
          <strong>create a modern and professional appearance,</strong> while highlighting
          their expertise and services.
        </li>
      </ul>
      <div class="stuff">
        <span class="tags">
          <span>Development</span>
          <span>Design</span>
        </span>
        <em>August to September 2020</em>
      </div>
    </div>

    <div class="xp">
      <h3>
        Java Developer Intern
        <mark>
          <a
            href="https://www.linkedin.com/company/informatique-banque-populaire/"
          >
            Informatique Banque Populaire
          </a>
        </mark>
      </h3>
      <ul>
        <li>
          <strong>Automated the testing</strong> of a banking application using the
          Selenium and Cucumber frameworks.
        </li>
      </ul>
      <div class="stuff">
        <span class="tags">
          <span>Development</span>
          <span>Testing</span>
        </span>
        <em>June to July 2020</em>
      </div>
    </div>
  </article>

  <article>
    <h2><User /> Personal Journey</h2>
    <div class="xp">
      <h3>
        <a href="https://thcon.party/">
          Toulouse Hacking Convention Organizer
        </a>
      </h3>
      <ul>
        <li>
          <a href="https://www.youtube.com/watch?v=kgNqzx8aR0I">
            <strong>Directed the production</strong> of a live audio and video broadcast.
          </a>
        </li>
        <li>
          <a href="https://github.com/GauBen/bastion">
            Designed and developed multiple challenges for the CTF competition.
          </a>
        </li>
        <li>
          <a href="https://21.thcon.fr/">
            Created a professional and engaging visual experience for the
            official website and the YouTube live stream.
          </a>
        </li>
      </ul>
      <div class="stuff">
        <span class="tags">
          <span>Management</span>
          <span>Cybersec</span>
          <span>Design</span>
        </span>
        <em>January to April 2022</em>
      </div>
    </div>
    <div class="xp">
      <h3>
        <a href="https://net7.dev/">
          President of net7, the ENSEEIHT IT Association
        </a>
      </h3>
      <ul>
        <li>
          <strong>Administrated a non-profit association,</strong> taking care of
          the legal, financial and administrative aspects.
        </li>
        <li>
          Provided technical training to the general public, with a particular
          focus on emerging technologies.
        </li>
        <li>Developed and maintained student services.</li>
        <li>
          Created the 2020 students brochure to promote the school to
          prospective students.
        </li>
      </ul>
      <p class="stuff">
        <span class="tags">
          <span>Legal</span>
          <span>Development</span>
          <span>Design</span>
        </span>
        <em>March 2020 to May 2021</em>
      </p>
    </div>
    <div class="xp">
      <h3>Hackathon Organizer and Host</h3>
      <ul>
        <li>
          Secured a partnership with Capgemini to sponsor the contest and
          provide gifts for the contestants.
        </li>
        <li>
          <a href="https://github.com/GauBen/perfect-aim">
            Developed an exclusive game for the event, tailored for ENSEEIHT
            students.
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/watch?v=ntsPfQbeVCw">
            Led a YouTube live stream and tournament with 60 teams.
          </a>
        </li>
      </ul>
      <div class="stuff">
        <span class="tags">
          <span>Event Host</span>
          <span>Development</span>
        </span>
        <em>December 2020</em>
      </div>
    </div>
    <div class="xp">
      <h3>Amateur Indoor & Outdoor Rock Climber</h3>
      <div class="stuff">
        <span class="tags">
          <span>Sports</span>
        </span>
        <em>Since 2012</em>
      </div>
    </div>
  </article>
  <article>
    <h2><Medal /> Skills</h2>
    <div class="grid">
      <div class="xp">
        <strong>Backend</strong>
        <span class="tags">
          <span>JavaScript</span>
          <span>TypeScript</span>
          <span>Python</span>
          <span>PHP</span>
        </span>
      </div>
      <div class="xp">
        <strong>Frontend</strong>
        <span class="tags">
          <span>Svelte</span>
          <span>Vue</span>
          <span>CSS</span>
          <span>Accessibility</span>
        </span>
      </div>
      <div class="xp">
        <strong>Math</strong>
        <span class="tags">
          <span>Cryptography</span>
          <span>Algorithmics</span>
          <span>Complexity Analysis</span>
        </span>
      </div>
      <div class="xp">
        <strong>Infrastructure</strong>
        <span class="tags">
          <span>Docker</span>
          <span>Kubernetes</span>
          <span>GitHub Actions</span>
          <span>GitLab CI</span>
        </span>
      </div>
      <div class="xp">
        <strong>Cross-functional skills</strong>
        <span class="tags">
          <span>Architecture</span>
          <span>Technical Writing</span>
          <span>Digital Security</span>
          <span>Database Tuning</span>
        </span>
      </div>
      <div class="xp">
        <strong>Soft skills</strong>
        <span class="tags">
          <span>Management</span>
          <span>Communication</span>
          <span>Teamwork</span>
        </span>
      </div>
    </div>
    <div class="xp">
      <h3>Languages</h3>
      <ul>
        <li><strong>French</strong>: mother tongue</li>
        <li><strong>English</strong>: fluent (C2, Linguaskill 180+)</li>
        <li><strong>Spanish</strong>: independent (B1)</li>
      </ul>
    </div>
  </article>
  <article>
    <h2><GraduationCap /> Education</h2>
    <div class="xp">
      <h3>
        <a href="https://tls-sec.github.io/">
          Master of Cybersecurity and Governance (TLS-SEC)
        </a>
      </h3>
      <p>
        2022, joint training with ENSEEIHT, INSA Toulouse and ENAC, Toulouse,
        France
      </p>
    </div>
    <div class="xp">
      <h3>
        <a
          href="https://www.enseeiht.fr/en/training/full-time-engineering-program/sn.html"
        >
          Master of Software and Systems Engineering
        </a>
      </h3>
      <p>2019–2022, ENSEEIHT, Toulouse, France</p>
    </div>
    <div class="xp">
      <h3>Preparatory classes MPSI and MP* (Maths and Physics, Elite level)</h3>
      <p>2017–2019, Lycée Saint-Louis, Paris, France</p>
    </div>
  </article>
</div>

<style lang="scss">
  :root {
    @media print {
      font-size: 14px;
      scrollbar-gutter: auto !important;
    }
  }

  .page :global(a) {
    all: revert;
    color: inherit;
    text-decoration: inherit;
  }

  .page :global(svg) {
    color: #0d3c77;
  }

  h2 {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    margin: 0;
    color: #0d3c77;
    background-color: #fff;
    border-bottom: 2px solid #0d3c77;
    page-break-after: avoid;
  }

  h3 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5em;
    align-items: end;
  }

  ul {
    padding-left: 2em;
  }

  mark {
    padding: 0.25em;
    font-family: system-ui;
    font-size: 1rem;
    font-weight: normal;
    background: linear-gradient(to bottom, #fff0 60%, #0d3c7733 61%);
  }

  .xp {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    margin: 1rem 0;
    page-break-inside: avoid;

    > * {
      margin: 0;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-block: 1rem;

    > .xp {
      margin: 0;
    }
  }

  .stuff {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.5em;

    > span {
      padding: 0.25em 0.5em;
      background-color: #0d3c7733;
      border-radius: 0.25em;
    }
  }

  .page {
    padding: 0 2rem;
    text-align: justify;

    > :global(*) {
      margin: 2rem auto;
    }

    @media screen {
      > :global(*) {
        max-width: 52rem;
      }
    }
  }
</style>
