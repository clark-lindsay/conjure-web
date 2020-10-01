<script lang="ts">
  import { beforeUpdate, tick } from "svelte";
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
  import CastButton from "./components/CastButton.svelte";
  import Alert from "./components/Alert.svelte";

  export let leftSidebarIsOpen: boolean = false;
  export let rightSidebarIsOpen: boolean = false;

  const appVersion: string = packageVersion();
  let disableCastButton: boolean = false;
  $: cursorNotAllowed = disableCastButton;
  let results = [];

  beforeUpdate(() => {
    const creatures = generateCreatuers();
    if (creatures.length === 0) {
      disableCastButton = true;
    } else {
      disableCastButton = false;
    }
  });

  function cast() {
    results = [generateCreatuers(), ...results];
  }

  function generateCreatuers(): any[] {
    let spell: ({}) => any[];
    if ($readSpellParameters.spellName === "Conjure Animals") {
      spell = conjureAnimals;
    } else if ($readSpellParameters.spellName === "Conjure Woodland Beings") {
      spell = conjureWoodlandBeings;
    } else {
      spell = conjureMinorElementals;
    }
    const { terrains, challengeRating } = $readSpellParameters;
    const sources = $readSourcebooks;
    return spell({
      terrains,
      challengeRating,
      sources,
    }).map((creature) => creature.name);
  }
</script>

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

{#if disableCastButton}
  <Alert
    mainText="Uh-Oh!"
    secondaryText="Your current options will not generate any creatueres! Maybe try adding more sourcebooks?" />
{/if}
<div class="flex justify-center m-4">
  <CastButton handleClick={cast} disabled={disableCastButton} />
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
