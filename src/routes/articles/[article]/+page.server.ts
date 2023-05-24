import { articles } from '$lib/articles'
import { error } from '@sveltejs/kit'

export const load = async ({ params }) => {
  const load = articles.get(params.article)
  if (!load) throw error(404)

  const { metadata } = await load()
  return metadata
}
