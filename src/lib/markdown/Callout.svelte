<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import WarningDiamond from "~icons/ph/warning-diamond-duotone";

  const {
    Icon = WarningDiamond,
    children,
  }: { Icon?: Component; children?: Snippet } = $props();
</script>

<div
  style="display: flex; gap: 1em; align-items: center; padding-inline: 1em; background: #eee; border-radius: 2px"
>
  <Icon aria-label="Warning" style="font-size: 1.5em;" />
  <div style="flex: 1">
    {@render children?.()}
  </div>
</div>
