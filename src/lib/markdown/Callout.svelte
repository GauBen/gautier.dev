<script lang="ts">
  import type { Snippet } from "svelte";
  import WarningDiamond from "~icons/ph/warning-diamond-duotone";
  import ArrowFatRight from "~icons/ph/arrow-fat-right-duotone";

  const icons = { warning: WarningDiamond, arrow: ArrowFatRight };

  const {
    icon = "warning",
    children,
  }: { icon: keyof typeof icons; children?: Snippet } = $props();
  const Icon = $derived(icons[icon]);
</script>

<div
  style="display: flex; gap: 1em; align-items: center; padding-inline: 1em; background: #eee; border-radius: 2px"
>
  <Icon aria-label="Warning" style="font-size: 1.5em;" />
  <div style="flex: 1">
    {@render children?.()}
  </div>
</div>
