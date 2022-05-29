<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = () => ({
    stuff: {
      title: 'Resume',
    },
  })

  export const hydrate = false
</script>

<div class="page">
  <header>
    <img src="https://gautier.dev/me.46c5928c.webp" alt="Me" />
    <h1>Gautier<br />Ben Aïm</h1>
    <div class="contact">
      <ul>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            ><path
              d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"
            /></svg
          > Toulouse
        </li>
        <li>
          <a href="https://gautier.dev">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                d="M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z"
              /></svg
            >
            gautier.dev
          </a>
        </li>
        <li>
          <a href="https://github.com/GauBen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              /></svg
            >
            github.com/GauBen
          </a>
        </li>
        <li>
          <a href="mailto:benaim.gautier@gmail.com">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"
              /></svg
            >
            benaim.gautier@gmail.com
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/gautier-ben-aim/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              ><path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              /></svg
            >
            linkedin.com/in/gautier-ben-aim
          </a>
        </li>
      </ul>
    </div>
  </header>
  <aside>Développeur web full-stack et expert en cyber sécurité</aside>
  <div class="grid">
    <div class="column">
      <article>
        <h2>Parcours professionnel</h2>
        <div class="xp">
          <p>
            <strong>Développeur web full-stack chez Escape</strong>
          </p>
          <ul>
            <li>
              Architecture et développement de fonctionnalités dans le SaaS
            </li>
          </ul>
          <div class="stuff">
            <span class="tags">
              <span>Cybersec</span>
              <span>TypeScript</span>
              <span>Vue</span>
              <span>Python</span>
            </span>
            <em>Mars à août 2022</em>
          </div>
        </div>
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
            <strong>
              Organisation d’un hackathon en partenariat avec Capgemini
            </strong>
          </p>
          <ul>
            <li>
              Développement d’un jeu exclusif pour les étudiants de l’ENSEEIHT
            </li>
            <li>Établissement d’un partenariat avec Capgemini</li>
            <li>
              Animation du live YouTube et du tournoi entre les 60 équipes
            </li>
          </ul>
          <div class="stuff">
            <span class="tags">
              <span>Python</span>
            </span>
            <em>Décembre 2020</em>
          </div>
        </div>
      </article>
      <article>
        <h2>Parcours personnel</h2>
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
          <p><strong>Grimpeur amateur en salle et en falaise</strong></p>
          <p class="stuff"><em>Depuis 2012</em></p>
        </div>
      </article>
    </div>
    <div class="column">
      <article>
        <h2>Compétences</h2>
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
        <h2>Formation</h2>
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
</div>

<style lang="scss">
  @media print {
    :root {
      font-size: 14px;
      scrollbar-gutter: auto !important;
    }
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    align-items: end;
    justify-content: center;

    img {
      width: 9rem;
      height: 9rem;
      border: 2px solid black;
    }

    h1 {
      margin: 0;
      margin-bottom: -0.2em;
      font-size: 3em;
      line-height: 1;
    }
  }

  aside {
    padding: 0.5rem 1rem;
    font-size: 1.1em;
    font-weight: bold;
    color: white;
    background-color: #9d2503;
  }

  article {
    position: relative;

    h2 {
      display: inline-block;
      padding: 0.25em 0.5em 0;
      margin: 0;
      background-color: white;
      border: 2px solid black;
      border-width: 2px 2px 0 2px;

      &::before {
        position: absolute;
        top: calc(1em * 1.5 + 0.25em);
        left: 0;
        z-index: -1;
        display: block;
        width: 100%;
        height: 2px;
        content: '';
        background: black;
      }
    }
  }

  a {
    all: revert;
    color: inherit;
    text-decoration: inherit;
  }

  ul {
    padding-left: 2em;
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

        svg {
          width: 1.25em;
        }
      }
    }
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @media print, (min-width: 50rem) {
      grid-template-columns: 6fr 4fr;
    }
  }

  .column {
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
      padding: 0.25em;
      background-color: #ccc;
    }
  }

  .page {
    padding: 1rem 2rem;
    text-align: justify;

    > :where(*) {
      margin: 1rem auto;
    }

    @media screen {
      > :where(*) {
        max-width: 52rem;
      }
    }
  }
</style>
