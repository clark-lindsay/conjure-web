<script lang="ts">
  import {
    conjureAnimals,
    conjureWoodlandBeings,
    conjureMinorElementals,
  } from "conjure5e";
  import { writeSpellParameters } from "../stores/writeSpellParameters";
  import { readSourcebooks } from "../stores/readSourcebooks";

  export let heading: string = "Spell Parameters";

  const spellOptions: string[] = [
    "Conjure Animals",
    "Conjure Woodland Beings",
    "Conjure Minor Elementals",
  ];
  let spell: ({}) => any[];
  $: if ($writeSpellParameters.spellName === "Conjure Animals") {
    spell = conjureAnimals;
  } else if ($writeSpellParameters.spellName === "Conjure Woodland Beings") {
    spell = conjureWoodlandBeings;
  } else {
    spell = conjureMinorElementals;
  }
  const crOptions: number[] = [0, 0.125, 0.25, 0.5, 1, 2];
  const terrainOptions: string[] = ["Land", "Water", "Air"];

  function forNonEmptyResults(challengeRating: number): boolean {
    if (
      spell({
        terrains: $writeSpellParameters.terrains,
        challengeRating,
        sources: $readSourcebooks,
      }).length > 0
    ) {
      return true;
    }
    return false;
  }
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

  <label
    for="challenge-rating-select"
    class="text-gray-700 text-xl my-1 mx-2">Challenge Rating of Creatures</label>
  <select
    bind:value={$writeSpellParameters.challengeRating}
    id="challenge-rating-select"
    class="my-1 mx-2"
    name="challenge-rating">
    {#each crOptions.filter((cr) => {
      if (spell({
          terrains: $writeSpellParameters.terrains,
          challengeRating: cr,
          sources: $readSourcebooks,
        }).length > 0) {
        return true;
      }
      return false;
    }) as cr}
      <option value={cr}>{cr}</option>
    {/each}
  </select>
</form>
