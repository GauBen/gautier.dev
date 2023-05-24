import type {
  create_ssr_component,
  SvelteComponentTyped,
} from 'svelte/internal'

export type Article = {
  metadata: {
    title: string
    description?: string
    date?: string
    snippet?: { code: string; lang: string }
  }
  default: ReturnType<typeof create_ssr_component> &
    (new (...args: unknown[]) => SvelteComponentTyped)
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
