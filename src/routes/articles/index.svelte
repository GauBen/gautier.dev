<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit/types'

  export const load: Load = async () => {
    const files = Object.entries(import.meta.glob('./*/index.md'))
    const articles = files.map(([file, importFile]) =>
      importFile().then(({ metadata }) => ({
        path: file.replace(/\/index.md$/, ''),
        ...metadata,
      }))
    )

    return {
      props: {
        articles: await Promise.all(articles),
      },
    }
  }
</script>

<script lang="ts">
  export let articles: Array<{ path: string; title: string }>
</script>

<ul>
  {#each articles as { path, title }}
    <li><a href={path}>{title}</a></li>
  {/each}
</ul>
