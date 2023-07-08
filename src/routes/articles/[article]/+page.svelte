<script lang="ts">
  import Header from '$lib/Header.svelte'
  import Prism from '$lib/Prism.svelte'
  import { formatDate } from '$lib/articles'
  import { onMount } from 'svelte'
  import '../../../assets/markdown-content.scss'

  export let data

  $: ({ component, date, snippet, title } = data)

  let mounted = false
  onMount(async () => {
    await import('giscus')
    mounted = true
  })
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
  {#if mounted}
    <section>
      <div>
        <giscus-widget
          id="comments"
          repo="gauben/gautier.dev"
          repoid="R_kgDOHTUX9A"
          category="Comments"
          categoryid="DIC_kwDOHTUX9M4CXmQB"
          mapping="og:title"
          strict="0"
          reactionsenabled="1"
          emitmetadata="0"
          inputposition="top"
          theme="preferred_color_scheme"
          lang="en"
          loading="lazy"
        />
      </div>
    </section>
  {/if}
  <footer>
    <p><a href="/">Back to the article list</a></p>
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

  section {
    padding: 0 0.5em;

    > * {
      max-width: var(--main-width);
      margin: 2em auto;
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
