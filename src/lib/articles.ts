import type { create_ssr_component } from 'svelte/internal'

export type Mdsvex = {
  metadata: App.Stuff
  default: ReturnType<typeof create_ssr_component>
}

export const articles = new Map(
  Object.entries(
    import.meta.glob<Mdsvex>(
      '../articles/*{.md,.svelte,/index.md,/index.svelte}'
    )
  ).map(([path, load]) => [
    path
      .replace(/^\.\.\/articles\//, '')
      .replace(/(\.md|\.svelte|\/index\.md|\/index\.svelte)$/, ''),
    load,
  ])
)

export const formatDate = (date: string | undefined) =>
  Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date ?? 0))
