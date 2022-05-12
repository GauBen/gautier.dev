import type { create_ssr_component } from 'svelte/internal'

export type Mdsvex = {
  metadata: App.Stuff
  default: ReturnType<typeof create_ssr_component>
}

export const articles: Map<string, () => Promise<Mdsvex>> = new Map(
  Object.entries(
    import.meta.glob('../articles/*{.md,.svelte,/index.md,/index.svelte}')
  ).map(([path, load]) => [
    path
      .replace(/^\.\.\/articles\//, '')
      .replace(/(\.md|\.svelte|\/index\.md|\/index\.svelte)$/, ''),
    load as () => Promise<Mdsvex>,
  ])
)

export const formatDate = (date: string | undefined) =>
  Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date ?? 0))
