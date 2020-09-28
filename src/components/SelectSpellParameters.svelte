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

<h2>{heading}</h2>
<form name="spell-parameters">
  <label for="spell-select">Spell</label>
  <select
    bind:value={$writeSpellParameters.spellName}
    id="spell-select"
    name="spell">
    {#each spellOptions as spell}
      <option value={spell}>{spell}</option>
    {/each}
  </select>

  <label for="challenge-rating-select">Challenge Rating of Creatures</label>
  <select
    bind:value={$writeSpellParameters.challengeRating}
    id="challenge-rating-select"
    name="challenge-rating">
    {#each crOptions as cr}
      <option value={cr}>{cr}</option>
    {/each}
  </select>

  {#each terrainOptions as terrain}
    <label>
      <input
        bind:group={$writeSpellParameters.terrains}
        type="checkbox"
        value={terrain} />
      {terrain}
    </label>
  {/each}
</form>
