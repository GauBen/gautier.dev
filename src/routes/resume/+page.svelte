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
  <div class="grid">
    <article>
      <h2><Suitcase /> Work Experience</h2>
      <div class="xp">
        <h3>
          Full-Stack & Cybersecurity Lead Engineer
          <mark>Escape (YC W23)</mark>
        </h3>
        <Timeline>
          <p><strong>Lead Engineer</strong></p>
          <ul>
            <li>
              <strong>Managed a team of 3 developers,</strong> ensuring communication,
              code quality and deadlines. Fostered innovation, independence and healthy
              team dynamics.
            </li>
            <li>
              Headed the creation of
              <strong>several corporate side-projects,</strong>
              including the GraphQL Security Academy, a learning platform for GraphQL
              security, and svelte-emails, a modern way to build complex transactional
              emails.
            </li>
            <li>
              Gave a conference talk at <strong>BSides Oslo</strong>
              on the <strong>State of GraphQL Security 2023,</strong> highlighting
              the company’s year of research.
            </li>
            <li>
              <strong>Pioneered the adoption of new technologies</strong> such as
              Temporal and Turbo to enhance developer productivity and product stability.
            </li>
          </ul>

          <p><strong>Full-Stack Engineer</strong></p>
          <ul>
            <li>
              Demonstrated resilience and perseverance in the
              <strong>Y Combinator accelerator program,</strong>
              shipping several sophisticated products that exceeded customer expectations,
              even when faced with challenges.
            </li>
            <li>
              <strong>Published technical articles</strong> on the corporate blog
              to showcase the company’s expertise and insights, while ensuring high-quality,
              informative, and engaging content.
            </li>
            <li>
              <strong>
                Successfully managed the migration of the GraphQL API
              </strong>
              from NestJS to Pothos and the frontend from Nuxt to SvelteKit, ensuring
              a smooth transition and improved performance and scalability.
            </li>
          </ul>

          <p><strong>Full-Stack Developer & Research Intern</strong></p>
          <ul>
            <li>
              <strong>Discovered GraphQL bombs,</strong> a novel attack vector against
              GraphQL APIs with file uploads enabled, which could be exploited to
              disrupt or crash servers.
            </li>
            <li>
              Initiated the <strong>creation of a design system</strong> to create
              a single source of truth for all design elements, helping to improve
              collaboration and communication between designers and developers.
            </li>
          </ul>
        </Timeline>

        <div class="stuff">
          <span class="tags">
            <span>Lead Dev</span>
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
          <mark>Freemindtronic</mark>
        </h3>
        <ul>
          <li>
            Developed a browser extension that provides
            <strong>secure end-to-end email encryption</strong> leveraging NFC cards
            as a cold storage device for private keys.
          </li>
          <li>
            Designed and implemented an OpenPGP HTTP keyserver that meets the
            <strong>
              specific security and compliance needs of government agencies.
            </strong>
          </li>
          <li>
            Architected a key splitting and backup system based on Shamir’s
            Secret Sharing to
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
          <mark>N7 Consulting</mark>
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
          <mark>Informatique Banque Populaire</mark>
        </h3>
        <ul>
          <li>
            <strong>Automated the testing</strong> of a banking application using
            the Selenium and Cucumber frameworks.
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
        <h3>Toulouse Hacking Convention Organizer</h3>
        <ul>
          <li>
            <strong>Directed the production</strong> of a live audio and video broadcast.
          </li>
          <li>
            Designed and developed multiple challenges for the CTF competition.
          </li>
          <li>
            Created a professional and engaging visual experience for a YouTube
            live stream.
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
        <h3>President of the ENSEEIHT IT Association</h3>
        <ul>
          <li>
            <strong>Administrated a non-profit association,</strong> taking care
            of the legal, financial and administrative aspects.
          </li>
          <li>
            Provided technical training to the general public, with a particular
            focus on emerging technologies.
          </li>
          <li>Developed and maintained student services.</li>
          <li>
            Created the 2020 ENSEEIHT students brochure to promote the school to
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
            Developed an exclusive game for the event, tailored for ENSEEIHT
            students.
          </li>
          <li>Led a YouTube live stream and tournament with 60 teams.</li>
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
      <h2><Medal /> Compétences</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr">
        <p class="xp">
          <strong>Backend</strong>
          <span class="tags">
            <span>JavaScript</span>
            <span>TypeScript</span>
            <span>Python</span>
            <span>PHP</span>
          </span>
        </p>
        <p class="xp">
          <strong>Frontend</strong>
          <span class="tags">
            <span>Vue</span>
            <span>Svelte</span>
            <span>CSS</span>
            <span>Accessibilité</span>
          </span>
        </p>
        <p class="xp">
          <strong>Infrastructure</strong>
          <span class="tags">
            <span>Docker</span>
            <span>Kubernetes</span>
            <span>GitHub Actions</span>
          </span>
        </p>
        <p class="xp">
          <strong>Compétences transversales</strong>
          <span class="tags">
            <span>Cybersec</span>
            <span>Architecture</span>
            <span>Base de données</span>
          </span>
        </p>
      </div>
      <div class="xp">
        <p><strong>Langues</strong></p>
        <ul>
          <li><strong>Français</strong> : langue maternelle</li>
          <li><strong>Anglais</strong> : courant (C2, Linguaskill 180+)</li>
          <li><strong>Espagnol</strong> : scolaire (B1)</li>
        </ul>
      </div>
    </article>
    <article>
      <h2><GraduationCap /> Formation</h2>
      <div class="xp">
        <p>
          <strong>Master de Cybersécurité et Gouvernance (TLS-SEC)</strong>
        </p>
        <p>2022, formation conjointe ENSEEIHT, INSA Toulouse et ENAC</p>
      </div>
      <div class="xp">
        <p><strong>Master de Génie Logiciel et des Systèmes</strong></p>
        <p>2019–2022, ENSEEIHT, Toulouse</p>
      </div>
      <div class="xp">
        <p><strong>Classe préparatoire MPSI et MP*</strong></p>
        <p>2017–2019, Lycée Saint-Louis, Paris</p>
      </div>
    </article>
  </div>
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

  .grid {
    display: flex;
    flex-direction: column;
  }

  .xp {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    margin: 1rem 0;

    > * {
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
