<script lang="ts">
  import type { Snippet } from "svelte";

  const icons = {
    warning: "i-ph:warning-diamond-duotone",
    arrow: "i-ph:arrow-fat-right-duotone",
    pencil: "i-ph:pencil-duotone",
  };

  const {
    icon = "warning",
    children,
  }: { icon: keyof typeof icons; children?: Snippet } = $props();
</script>

<div
  style="display: flex; gap: 1em; align-items: center; padding-inline: 1em; background: #eee; border-radius: 2px"
>
  <span class={icons[icon]} style="font-size: 1.5em">{icon}</span>
  <div style="flex: 1">
    {@render children?.()}
  </div>
</div>
