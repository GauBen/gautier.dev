<script lang="ts">
  import { resolve } from "$app/paths";
  import "$assets/markdown-content.scss";
  import { formatDate } from "$lib/articles";
  import Header from "$lib/Header.svelte";
  import { getSnippet } from "../../snippet.remote.js";

  const { data } = $props();
  const { slug, title, date, snippet, banner, Article } = $derived(data);

  $effect(() => {
    import("giscus");
  });
</script>

<Header>
  {#if banner}
    <enhanced:img
      src={banner}
      alt=""
      style="width: 100%; max-height: 10rem; object-fit: cover"
    />
  {:else if snippet}
    <div class="snippet">
      <pre class="language-{snippet.lang}">{@html await getSnippet(slug)}</pre>
    </div>
  {/if}
</Header>

<article>
  <header>
    <h1 class:draft={!date}>{title}</h1>
    {#if date}
      <p class="date">
        <time datetime={date.toISOString()}>{formatDate(date)}</time>
      </p>
    {:else}
      <p class="date">Unpublished draft</p>
    {/if}
  </header>
  <Article />
  <section>
    <h2 id="comments">
      <a href="#comments" style="margin-right: 0.5rem" title="Link to comments"
        >#</a
      >Comments
    </h2>
    <div>
      <giscus-widget
        id="comments"
        repo="gauben/gautier.dev"
        repoid="R_kgDOHTUX9A"
        category="Comments"
        categoryid="DIC_kwDOHTUX9M4CXmQB"
        mapping="specific"
        term={title}
        strict="0"
        reactionsenabled="1"
        emitmetadata="0"
        inputposition="top"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
      >
        <!-- Loading placeholder, for server-side rendering -->
        <div
          style="display: flex; flex-flow: column; gap: 1em; align-items: center; margin-bottom: 6.5em"
        >
          <div
            style="width: 3em; height: 3em; background: url('https://github.githubassets.com/images/mona-loading-default.gif') no-repeat center/contain"
          ></div>
          <span
            style="font-size: .875rem; line-height: 1.25rem; color: #656d76"
          >
            Loading comments...
          </span>
        </div>
      </giscus-widget>
    </div>
  </section>
  <footer>
    <p><a href={resolve("/")}>Back to the article list</a></p>
  </footer>
</article>

<style lang="scss">
  header {
    padding: 0 1em;
    contain: paint;

    > :global(*) {
      max-width: var(--main-width);
      margin-inline: auto;
    }

    h1,
    .date {
      text-align: center;
      text-wrap: balance;
    }

    h1 {
      margin-block: 1em 0;
      font-size: 3em;
      line-height: 1;
    }

    .date {
      margin-top: 0;
      font-size: 1.5em;
      font-weight: lighter;
      opacity: 0.75;
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
    text-wrap: balance;
  }

  .draft {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    overflow: hidden;

    &::before {
      position: absolute;
      font-size: 2em;
      line-height: 0.5;
      color: #8888;
      pointer-events: none;
      content: "Draft";
      transform: rotate(-10deg);
      transition: 0.2s ease-in-out;
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
