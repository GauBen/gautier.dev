import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async () => {
  const files = Object.entries(import.meta.glob('./articles/*{.md,/index.md}'))
  const articles = files.map(([file, importFile]) =>
    importFile().then(({ metadata }) => ({
      path: file.replace(/(\/index)?\.md$/, ''),
      ...metadata,
    }))
  )

  return {
    body: {
      articles: await Promise.all(articles),
    },
  }
}
