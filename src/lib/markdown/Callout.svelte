<script lang="ts">
  import Arrow from "@iconify-svelte/ph/arrow-fat-right-duotone";
  import Pencil from "@iconify-svelte/ph/pencil-duotone";
  import Warning from "@iconify-svelte/ph/warning-diamond-duotone";
  import type { Snippet } from "svelte";

  const {
    icon = "warning",
    children,
  }: { icon: "warning" | "arrow" | "pencil"; children?: Snippet } = $props();
</script>

<div
  style="display: flex; gap: 1em; align-items: center; padding-inline: 1em; background: #eee; border-radius: 2px"
>
  <div style="font-size: 1.5em">
    {#if icon === "warning"}
      <Warning class="icon" aria-label="Warning" />
    {:else if icon === "arrow"}
      <Arrow class="icon" aria-label="Note" />
    {:else if icon === "pencil"}
      <Pencil class="icon" aria-label="Content update" />
    {/if}
  </div>
  <div style="flex: 1">
    {@render children?.()}
  </div>
</div>
