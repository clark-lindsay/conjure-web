<script lang="ts">
  import { writeSpellParameters } from "../stores/writeSpellParameters";

  export let heading: string = "Spell Parameters";

  const spellOptions: string[] = [
    "Conjure Animals",
    "Conjure Woodland Beings",
    "Conjure Minor Elementals",
  ];
  const crOptions: number[] = [0, 0.125, 0.25, 0.5, 1, 2];
  const terrainOptions: string[] = ["Land", "Water", "Air"];
</script>

<h2 class="text-blue-700 text-2xl mx-2">{heading}</h2>
<form name="spell-parameters">
  <label
    for="spell-select"
    class="text-gray-700 text-xl my-1 mx-2">Spell</label>
  <select
    bind:value={$writeSpellParameters.spellName}
    id="spell-select"
    name="spell"
    class="my-1 mx-2">
    {#each spellOptions as spell}
      <option value={spell}>{spell}</option>
    {/each}
  </select>

  <label
    for="challenge-rating-select"
    class="text-gray-700 text-xl my-1 mx-2">Challenge Rating of Creatures</label>
  <select
    bind:value={$writeSpellParameters.challengeRating}
    id="challenge-rating-select"
    class="my-1 mx-2"
    name="challenge-rating">
    {#each crOptions as cr}
      <option value={cr}>{cr}</option>
    {/each}
  </select>

  <h2 class="text-gray-700 text-xl my-1 mx-2">Terrains</h2>
  {#each terrainOptions as terrain}
    <label class="text-lg my-1 mx-2">
      <input
        bind:group={$writeSpellParameters.terrains}
        type="checkbox"
        value={terrain} />
      {terrain}
    </label>
  {/each}
</form>
