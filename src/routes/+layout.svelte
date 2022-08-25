<script lang="ts">
  import { page } from '$app/stores'
  import '../app.scss'

  $: ({ title, description } = $page.data)
</script>

<svelte:head>
  <title>{title}</title>
  {#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<slot />
