<script lang="ts" context="module">
  import { page } from '$app/stores'
  import { articles, formatDate } from '$lib/articles'
  import Header from '$lib/Header.svelte'
  import Prism from '$lib/Prism.svelte'
  import type { Load } from '@sveltejs/kit'
  import type { SvelteComponent } from 'svelte'
  import '../../assets/markdown-content.scss'

  export const load: Load = async ({ props, params }) => {
    const { stuff, css, html } = props
    if (html) return { stuff, props: { css, html } }

    const load = articles.get(params.article)
    if (!load) return { status: 404 }

    const { default: component } = await load()
    return { stuff, props: { css, component } }
  }
</script>

<script lang="ts">
  export let css = ''
  export let html: string | false = false
  export let component: SvelteComponent | undefined = undefined
  $: ({ title, date, snippet } = $page.stuff)
</script>

<svelte:head>
  {#if css}
    {@html '<' + 'style>' + css + '<' + '/style>'}
  {/if}
</svelte:head>

<Header>
  {#if snippet}
    <div class="snippet">
      <Prism {...snippet} />
    </div>
  {/if}
</Header>

<article>
  <header>
    <h1>{title}</h1>
    {#if date}
      <p class="date">
        <time datetime={new Date(date).toISOString()}>{formatDate(date)}</time>
      </p>
    {/if}
  </header>
  <div class="markdown-content">
    {#if html}
      {@html html}
    {:else}
      <svelte:component this={component} />
    {/if}
  </div>
  <footer>
    <p><a href="/" sveltekit:prefetch>Back to the article list</a></p>
  </footer>
</article>

<style lang="scss">
  header {
    padding: 0 1em;
    overflow: hidden;

    > :global(*) {
      max-width: var(--main-width);
      margin-inline: auto;
    }

    h1,
    .date {
      text-align: center;
    }

    h1 {
      margin-top: 1em;
      margin-bottom: 0;
      font-size: 3em;
      line-height: 1;
    }

    .date {
      margin-top: 0;
      font-size: 1.5em;
      font-weight: lighter;
      opacity: 0.5;
    }
  }
  footer {
    text-align: center;
  }

  .snippet {
    padding: 1em 0.5em;
    background-color: var(--prism-bg);

    :global(pre) {
      max-width: var(--main-width);
      padding: 0;
      margin: 0 auto;
    }
  }
</style>
