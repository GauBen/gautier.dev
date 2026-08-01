<script lang="ts">
  import "#assets/markdown-content.css";
  import Head from "#lib/Head.svelte";
  import type { ComponentProps, Snippet } from "svelte";

  const {
    frontmatter,
    children,
  }: { frontmatter: ComponentProps<typeof Head>; children: Snippet } = $props();
</script>

<Head {...frontmatter} />

<div class="markdown-content">
  {@render children()}
</div>
