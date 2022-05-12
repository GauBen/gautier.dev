import type { RequestHandler } from '@sveltejs/kit'
import type { create_ssr_component } from 'svelte/internal'

export type Mdsvex = {
  metadata: App.Stuff
  default: ReturnType<typeof create_ssr_component>
}

export const articles: Map<string, () => Promise<Mdsvex>> = new Map(
  Object.entries(
    import.meta.glob('../../articles/*{.md,.svelte,/index.md,/index.svelte}')
  ).map(([path, load]) => [
    path
      .replace(/^\.\.\/\.\.\/articles\//, '')
      .replace(/(\.md|\.svelte|\/index\.md|\/index\.svelte)$/, ''),
    load as () => Promise<Mdsvex>,
  ])
)

export const get: RequestHandler = async ({ params }) => {
  const load = articles.get(params.article)
  if (!load) return { status: 404 }

  const { metadata: stuff, default: component } = await load()
  const hydrate = stuff.hydrate ?? false
  const { css, html } = component.render()
  return { body: { stuff, hydrate, css: css.code, html } }
}
