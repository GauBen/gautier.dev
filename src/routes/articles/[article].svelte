<script lang="ts" context="module">
  import { page } from '$app/stores'
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

    return {
      stuff: module.metadata,
      props: {
        component: module.default,
      },
    }
  }
</script>

<script lang="ts">
  export let component: SvelteComponent
  $: ({ title, snippet } = $page.stuff)
</script>

<h1>{title}</h1>
{#if snippet}
  <pre>{snippet.code}</pre>
{/if}

<svelte:component this={component} />

<p><a href="/" sveltekit:prefetch>Back to the article list</a></p>
