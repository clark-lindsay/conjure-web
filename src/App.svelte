<script lang="ts">
  import { readSourcebooks } from "./stores/readSourcebooks";
  import { readSpellParameters } from "./stores/readSpellParameters";
  import {
    conjureAnimals,
    conjureMinorElementals,
    conjureWoodlandBeings,
  } from "conjure5e";
  import { packageVersion } from "./getPackageInfo";

  import Navbar from "./components/Navbar.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import SelectSpellParameters from "./components/SelectSpellParameters.svelte";
  import SelectSourcebooks from "./components/SelectSourcebooks.svelte";
  import ResultBox from "./components/ResultBox.svelte";

  export let leftSidebarIsOpen: boolean = false;
  export let rightSidebarIsOpen: boolean = false;
  let results = [];
  const appVersion: string = packageVersion();

  function cast() {
    let spell;
    if ($readSpellParameters.spellName === "Conjure Animals") {
      spell = conjureAnimals;
    } else if ($readSpellParameters.spellName === "Conjure Woodland Beings") {
      spell = conjureWoodlandBeings;
    } else {
      spell = conjureMinorElementals;
    }
    const { terrains, challengeRating } = $readSpellParameters;
    const sources = $readSourcebooks;
    const result = spell({
      terrains,
      challengeRating,
      sources,
    }).map((creature) => creature.name);
    results = [result, ...results];
  }
</script>

<style>
</style>

<svelte:head>
  <link
    href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
    rel="stylesheet" />
</svelte:head>
<Navbar
  heading="Conjure5e{appVersion ? ` ${appVersion}` : ''}"
  bind:spellOptionsMenu={leftSidebarIsOpen}
  bind:sourceOptionsMenu={rightSidebarIsOpen} />
<Sidebar bind:open={leftSidebarIsOpen}>
  <SelectSpellParameters />
</Sidebar>
<Sidebar bind:open={rightSidebarIsOpen} left={false}>
  <SelectSourcebooks />
</Sidebar>

<div class="flex justify-center m-4">
  <button
    on:click={() => cast()}
    name="cast-spell"
    id="cast-spell-button"
    class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4
      border border-gray-400 rounded shadow">Cast Spell</button>
</div>
<div class="flex flex-col justify-center items-center text-center">
  {#each results as result}
    <ResultBox>
      <ul>
        {#each result as creature}
          <li>{creature}</li>
        {/each}
      </ul>
    </ResultBox>
  {/each}
</div>
