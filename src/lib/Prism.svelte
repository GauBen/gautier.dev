<script lang="ts">
  import { highlight } from "$lib/prism.js";

  const { code, lang = "ts" }: { code: string; lang?: string } = $props();
</script>

<pre class="language-{lang}">{@html highlight(code, lang)}</pre>
