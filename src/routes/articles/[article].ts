import { articles } from '$lib/articles.js'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ params }) => {
  const load = articles.get(params.article)
  if (!load) return { status: 404 }

  const { metadata: stuff, default: component } = await load()
  const hydrate = stuff.hydrate ?? false
  const { css, html } = component.render()
  return { body: { stuff, hydrate, css: css.code, html: !hydrate && html } }
}
