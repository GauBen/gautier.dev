import { articles } from '$lib/articles'
import { error } from '@sveltejs/kit'
import '../../../assets/markdown-content.scss'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ data, params }) => {
  const load = articles.get(params.article)
  if (!load) throw error(404)

  const { default: component } = await load()
  return { ...data, component }
}
