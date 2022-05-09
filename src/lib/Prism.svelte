<script lang="ts">
  import 'highlight.js/styles/atom-one-dark.css'
  import { highlight } from './highlight.js'
  export let code: string
  export let lang = 'javascript'
</script>

<pre><code class="hljs language-{lang}">{@html highlight(code, lang)}</code
  ></pre>
