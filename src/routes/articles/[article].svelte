<script lang="ts" context="module">
  import { page } from '$app/stores'
  import Prism from '$lib/Prism.svelte'
  import type { Load } from '@sveltejs/kit'
  import type { SvelteComponent } from 'svelte'
  import { articles } from './[article].js'

  export const load: Load = async ({ props, params }) => {
    const { stuff, hydrate, css, html } = props
    if (!hydrate) return { stuff, props: { hydrate, css, html } }

    const load = articles.get(params.article)
    if (!load) return { status: 404 }

    const { default: component } = await load()
    return { stuff, props: { hydrate, css, component } }
  }
</script>

<script lang="ts">
  export let hydrate = false
  export let css = ''
  export let html = ''
  export let component: SvelteComponent | undefined = undefined
  $: ({ title, snippet } = $page.stuff)
</script>

<svelte:head>
  {@html '<' + 'style>' + css + '<' + '/style>'}
</svelte:head>

<h1>{title}</h1>
{#if snippet}
  <Prism {...snippet} />
{/if}

{#if hydrate}
  <svelte:component this={component} />
{:else}
  {@html html}
{/if}

<p><a href="/" sveltekit:prefetch>Back to the article list</a></p>
