import type { SvelteComponent } from 'svelte'

export type Article = {
  metadata: {
    title: string
    draft?: boolean
    description?: string
    date?: string
    snippet?: { code: string; lang: string }
  }
  default: new (...args: unknown[]) => SvelteComponent
}

export const articles = new Map(
  Object.entries(
    import.meta.glob<Article>(
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
