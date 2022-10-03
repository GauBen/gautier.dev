<script lang="ts">
  import { formatDate } from '$lib/articles'
  import Header from '$lib/Header.svelte'
  import Prism from '$lib/Prism.svelte'
  import '../../../assets/markdown-content.scss'
  import type { PageData } from './$types'

  export let data: PageData

  $: ({ component, date, snippet, title } = data)
</script>

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
    <svelte:component this={component} />
  </div>
  <footer>
    <p><a href="/" data-sveltekit-prefetch>Back to the article list</a></p>
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
