<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit'

  export const load: Load = () => ({
    stuff: {
      title: 'Resume',
    },
  })
</script>

<h1>👀</h1>

<style>
  h1 {
    text-align: center;
  }
</style>
