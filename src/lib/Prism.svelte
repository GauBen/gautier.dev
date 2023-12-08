<script lang="ts">
  import { highlight } from "$lib/prism.js";

  const { code, lang = "js" } = $props<{
    code: string;
    lang?: string;
  }>();
</script>

<pre class="language-{lang}">{@html highlight(code, lang)}</pre>
