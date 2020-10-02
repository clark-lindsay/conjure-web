<script lang="ts">
  export let name: string = "Cast Spell";
  export let disabled: boolean = false;
  export let handleClick = () => console.log("Click!");
</script>

{#if disabled}
  <button
    {name}
    id="cast-spell-button"
    class="bg-white hover:bg-red-100 text-red-700 font-semibold py-2 px-4 border
      border-red-400 rounded shadow cursor-not-allowed">
    {name}
  </button>
{:else}
  <button
    on:click={handleClick}
    {name}
    id="cast-spell-button"
    class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4
      border border-gray-400 rounded shadow">
    {name}
  </button>
{/if}
