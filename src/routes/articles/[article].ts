import { articles } from '$lib/articles'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ params }) => {
  const load = articles.get(params.article)
  if (!load) return { status: 404 }

  const { metadata: stuff, default: component } = await load()
  const { css, html } = component.render()
  return { body: { stuff, html: !stuff.hydrate && html, css: css.code } }
}
