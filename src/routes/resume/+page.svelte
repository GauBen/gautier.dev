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
        <h3>Full-Stack & Cybersecurity Lead Engineer at Escape (YC W23)</h3>
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
              on the State of GraphQL Security 2023, highlighting the company's year
              of research.
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
              to showcase the company's expertise and insights, while ensuring high-quality,
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
        <p>
          <strong>
            Développement d’une solution de chiffrement à Freemindtronic
          </strong>
        </p>
        <ul>
          <li>
            Conception et développement d’une extension de navigateur pour
            chiffrer et déchiffrer des emails à l’aide d’une carte NFC
          </li>
          <li>Conception et développement d’un serveur de clés PGP</li>
          <li>Formation des nouveaux employés</li>
        </ul>
        <div class="stuff">
          <span class="tags">
            <span>Cybersec</span>
            <span>TypeScript</span>
            <span>Svelte</span>
          </span>
          <em>Juin à août 2021</em>
        </div>
      </div>

      <div class="xp">
        <p>
          <strong>Web developer for N7 Consulting</strong>
        </p>
        <ul>
          <li>
            Redesigned the site n7consulting.fr into a static site with Eleventy
            and Parcel
          </li>
        </ul>
        <div class="stuff">
          <span class="tags">
            <span>TypeScript</span>
            <span>Stylus</span>
          </span>
          <em>Juin à septembre 2020</em>
        </div>
      </div>

      <div class="xp">
        <p>
          <strong>Internship at Informatique Banque Populaire</strong>
        </p>
        <ul>
          <li>
            Junior Java Developer: wrote tests for a banking application, with
            the frameworks Selenium and Cucumber
          </li>
        </ul>
        <div class="stuff">
          <span class="tags">
            <span>Java</span>
          </span>
          <em>Juin à août 2020</em>
        </div>
      </div>
    </article>

    <article>
      <h2><User /> Parcours personnel</h2>
      <div class="xp">
        <p>
          <strong>Organisation de la Toulouse Hacking Convention</strong>
        </p>
        <ul>
          <li>Développement de plusieurs challenges pour le CTF</li>
          <li>Création et développement de l’habillage du live YouTube</li>
          <li>Régisseur principal de la diffusion en direct</li>
        </ul>
        <div class="stuff">
          <span class="tags">
            <span>Cybersec</span>
            <span>TypeScript</span>
            <span>Svelte</span>
            <span>Docker</span>
          </span>
          <em>Janvier à avril 2022</em>
        </div>
      </div>
      <div class="xp">
        <p>
          <strong>
            President de l’association informatique de l’ENSEEIHT
          </strong>
        </p>
        <ul>
          <li>Administration d’une association loi 1901</li>
          <li>Développement et maintenance des services étudiants</li>
          <li>Organisation de formations techniques tout public</li>
          <li>
            Création de l'édition 2020 de la plaquette alpha de l’ENSEEIHT
          </li>
        </ul>
        <p class="stuff">
          <span class="tags">
            <span>Kubernetes</span>
          </span>
          <em>Mars 2020 à mai 2021</em>
        </p>
      </div>
      <div class="xp">
        <p>
          <strong>
            Organisation d’un hackathon en partenariat avec Capgemini
          </strong>
        </p>
        <ul>
          <li>
            Développement d’un jeu exclusif pour les étudiants de l’ENSEEIHT
          </li>
          <li>Établissement d’un partenariat avec Capgemini</li>
          <li>Animation du live YouTube et du tournoi entre les 60 équipes</li>
        </ul>
        <div class="stuff">
          <span class="tags">
            <span>Python</span>
          </span>
          <em>Décembre 2020</em>
        </div>
      </div>
      <div class="xp">
        <p><strong>Grimpeur amateur en salle et en falaise</strong></p>
        <p class="stuff"><em>Depuis 2012</em></p>
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

  ul {
    padding-left: 2em;
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
      background-color: #ced8e4;
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
