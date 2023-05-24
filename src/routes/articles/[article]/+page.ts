import { articles } from '$lib/articles'
import { error } from '@sveltejs/kit'

export const load = async ({ data, params }) => {
  const load = articles.get(params.article)
  if (!load) throw error(404)

  const { default: component } = await load()
  return { ...data, component }
}
