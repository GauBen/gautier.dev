import { articles } from '$lib/articles'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const load = articles.get(params.article)
  if (!load) throw error(404)

  const { metadata } = await load()
  return metadata
}