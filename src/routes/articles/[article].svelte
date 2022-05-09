<script lang="ts" context="module">
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import Prism from '$lib/Prism.svelte'
  import type { Load } from '@sveltejs/kit'
  import type { SvelteComponent } from 'svelte'

  export const load: Load = async ({ params }) => {
    const { article } = params

    const modules = await Promise.allSettled([
      import(`../../articles/${article}.md`),
      import(`../../articles/${article}.svelte`),
      import(`../../articles/${article}/index.md`),
      import(`../../articles/${article}/index.svelte`),
    ])

    const [module] = modules
      .filter(
        (
          promise
        ): promise is PromiseFulfilledResult<{
          metadata: App.Stuff
          default: SvelteComponent
        }> => promise.status === 'fulfilled'
      )
      .map(({ value }) => value)

    if (!module) return { status: 404 }

    const { metadata: stuff, default: component } = module
    if (browser) return { stuff, props: { component } }

    // Prerender and extract CSS to prevent FOUC
    const { css, head } = component.render()
    return { stuff, props: { head, css: css.code, component } }
  }
</script>

<script lang="ts">
  export let component: SvelteComponent
  export let head: string = ''
  export let css: string = ''
  $: ({ title, snippet } = $page.stuff)
</script>

<svelte:head>
  {@html head}
  {@html '<' + 'style>' + css + '<' + '/style>'}
</svelte:head>

<h1>{title}</h1>
{#if snippet}
  <Prism {...snippet} />
{/if}

<svelte:component this={component} />

<p><a href="/" sveltekit:prefetch>Back to the article list</a></p>
