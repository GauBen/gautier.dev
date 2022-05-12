/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  // interface Locals {}
  // interface Platform {}
  // interface Session {}
  interface Stuff {
    title: string
    date?: string
    snippet?: { code: string; lang: string }
    hydrate?: boolean
  }
}
