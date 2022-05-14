// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Stuff {
    title: string
    description?: string
    date?: string
    snippet?: { code: string; lang: string }
    hydrate?: boolean
  }
}
