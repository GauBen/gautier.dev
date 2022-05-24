<script lang="ts" context="module">
  import { formatDate } from '$lib/articles'
  import Card from '$lib/Card.svelte'
  import Header from '$lib/Header.svelte'
  import Prism from '$lib/Prism.svelte'
  import type { Load } from '@sveltejs/kit'

  export const hydrate = false

  export const load: Load = ({ props }) => ({
    props,
    stuff: {
      title: 'Gautier Ben Aïm',
      description:
        'Fullstack web developer, security specialist & design enthusiast.',
    },
  })
</script>

<script lang="ts">
  export let articles: Array<{ path: string } & App.Stuff>
</script>

<Header />

<main>
  <h1>Hey!</h1>
  <p>
    My name is Gautier and I'm a full stack web engineer, cybersecurity
    engineer, design enthusiast and hackathon organizer.
  </p>
  <p>
    I'm currently doing my final engineering project as a software and
    cybersecurity developer at <a href="https://escape.tech/">Escape</a>.
  </p>
  <p>
    In September 2022, I'll graduate with a master's degree in software
    engineering and a master's degree in cybersecurity.
  </p>
  <p class="center"><a href="/resume" class="btn">View my resume</a></p>
  <h2>Latest articles</h2>
  <div class="grid">
    {#each articles as { path, title, description, date, snippet }}
      <Card>
        <svelte:fragment slot="header">
          {#if snippet}
            <div class="snippet">
              <Prism {...snippet} />
            </div>
          {/if}
        </svelte:fragment>
        <h2><a href="/articles/{path}" sveltekit:prefetch>{title}</a></h2>
        {#if description}<p>{description}</p>{/if}
        <p>{formatDate(date)}</p>
      </Card>
    {/each}
  </div>
</main>

<style lang="scss">
  main {
    max-width: var(--main-width);
    padding: 0 0.5em;
    margin: 0 auto;
    overflow: hidden;
  }

  .center {
    text-align: center;
  }

  .btn {
    display: inline-block;
    padding: 0.5em 1em;

    background-image: linear-gradient(var(--link), var(--link));
    background-repeat: no-repeat;
    background-position: right;
    background-size: 0 100%;
    border: 0.0625em solid var(--link);
    border-radius: 0.75em;
    border-radius: 1.3em;
    transition: 150ms color, 150ms background-size;

    &:hover,
    &:focus {
      color: white;
      background-position: left;
      background-size: 100% 100%;
      outline: none;
    }
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin: 1em 0;
  }

  .snippet {
    box-shadow: 0 0 0.25em #ccc;
  }
</style>
