<script lang="ts">
  let color: string
  let label: string

  const gold = () => {
    color = 'gold'
    label = 'Magic ✨'
  }
  const red = () => {
    color = 'firebrick'
    label = 'Magic 🚒'
  }
  const blue = () => {
    color = 'navy'
    label = 'Magic 🚓'
  }

  gold()
</script>

<div style:background-color={color}>
  <button>{label}</button>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3em 0;
    box-shadow: 0 0 1em #8888 inset;
  }

  button {
    padding: 1em;
  }
</style>
