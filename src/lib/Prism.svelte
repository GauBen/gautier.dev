<script lang="ts">
  import { highlight } from '$lib/prism.js'
  export let code: string
  export let lang = 'javascript'
</script>

<pre class="language-{lang}">{@html highlight(code, lang)}</pre>

<style lang="scss">
  pre {
    margin: 0;
  }
</style>
