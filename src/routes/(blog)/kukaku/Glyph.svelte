<script lang="ts" module>
  /** Symbol drawn in place of each digit: name, outline, fill and stroke. */
  const GLYPHS: Record<number, [string, string, string, string]> = {
    1: [
      "yellow star",
      "M12 1.5l3.1 6.6 7.2.9-5.3 5 1.3 7.1L12 17.6l-6.3 3.5L7 14l-5.3-5 7.2-.9z",
      "#ffc83d",
      "#8a6400",
    ],
    2: [
      "red circle",
      "M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z",
      "#e5484d",
      "#8c1d22",
    ],
    3: ["blue gem", "M6.5 3.5h11l4.5 6-10 12-10-12z", "#3e8ee8", "#174f8f"],
    4: ["green triangle", "M12 2.5l10 18H2z", "#3fb26b", "#1b6b3a"],
    5: ["purple square", "M4 4h16v16H4z", "#9b6ddb", "#583591"],
    6: [
      "orange diamond",
      "M12 1.5l9.5 10.5-9.5 10.5-9.5-10.5z",
      "#ff8c3a",
      "#9a4705",
    ],
  };

  /** Name of the symbol of `digit`, or the digit itself if it has none. */
  export const glyphName = (digit: number) =>
    GLYPHS[digit]?.[0] ?? String(digit);
</script>

<script lang="ts">
  const { digit }: { digit: number } = $props();
</script>

<!-- Decorative: the name of the symbol is given by the context -->
{#if GLYPHS[digit]}
  {@const [, shape, fill, stroke] = GLYPHS[digit]}
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d={shape}
      {fill}
      {stroke}
      stroke-width="1.5"
      stroke-linejoin="round"
    />
  </svg>
{:else}
  {digit}
{/if}

<style>
  svg {
    width: 1em;
    height: 1em;
    overflow: visible;
    vertical-align: -0.15em;
  }
</style>
