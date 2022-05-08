<script lang="ts">
  import { page } from '$app/stores'
  import '../app.scss'
</script>

<svelte:head>
  <title>{$page.stuff.title}</title>
</svelte:head>

<slot />
