import type { PageLoad } from './$types'

export const hydrate = false

export const load: PageLoad = ({ data }) => ({
  ...data,
  title: 'Gautier Ben Aïm',
  description:
    'Fullstack web developer, security specialist & design enthusiast.',
})
