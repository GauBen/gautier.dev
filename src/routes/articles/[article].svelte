<script lang="ts" context="module">
  import { page } from '$app/stores'
  import { articles } from '$lib/articles'
  import Prism from '$lib/Prism.svelte'
  import type { Load } from '@sveltejs/kit'
  import type { SvelteComponent } from 'svelte'

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
  import { formatDate } from '$lib/articles.js'

  export let css = ''
  export let html: string | false = false
  export let component: SvelteComponent | undefined = undefined
  $: ({ title, description, date, snippet } = $page.stuff)
</script>

<svelte:head>
  {#if css}
    {@html '<' + 'style>' + css + '<' + '/style>'}
  {/if}
</svelte:head>

<h1>{title}</h1>
{#if description || date}
  <p>{description ?? ''} {date ? formatDate(date) : ''}</p>
{/if}
{#if snippet}
  <Prism {...snippet} />
{/if}

<div class="markdown-content">
  {#if html}
    {@html html}
  {:else}
    <svelte:component this={component} />
  {/if}
</div>

<p><a href="/" sveltekit:prefetch>Back to the article list</a></p>

<style lang="scss" global>
  @use '../../assets/markdown-content.scss';
</style>
