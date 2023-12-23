<script lang="ts">
  const { src } = $props<{ src: string }>();

  const check = async (src: string) =>
    new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
</script>

{#await check(src)}
  Loading...
{:then}
  Logged in!
{:catch}
  Not logged in
{/await}
