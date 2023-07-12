<script lang="ts">
  import "$assets/markdown-content.scss";
  import Header from "$lib/Header.svelte";
  import Prism from "$lib/Prism.svelte";
  import { formatDate } from "$lib/articles";
  import { onMount } from "svelte";
  import "../../../assets/markdown-content.scss";

  export let data;

  $: ({ component, date, draft, snippet, title } = data);

  let mounted = false;
  onMount(async () => {
    await import("giscus");
    mounted = true;
  });
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
    <h1 class:draft>{title}</h1>
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

  .draft {
    max-width: 100%;
    overflow: hidden;

    &::before {
      position: absolute;
      right: 2em;
      left: 2em;
      font-size: 2em;
      line-height: 0.5;
      color: #8888;
      pointer-events: none;
      content: "Draft";
      transition: 0.2s ease-in-out;
      transform: rotate(-10deg);
    }

    &:hover::before {
      transform: rotate(10deg);
    }
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
