<script lang="ts">
  import { beforeUpdate } from "svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { readSourcebooks } from "./stores/readSourcebooks";
  import { readSpellParameters } from "./stores/readSpellParameters";
  import {
    conjureAnimals,
    conjureMinorElementals,
    conjureWoodlandBeings,
  } from "conjure5e";
  import type { Creature } from "conjure5e/dist/src/Creature";
  import { packageVersion } from "./getPackageInfo";
  import { send, receive } from "./animations";

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
  interface Result {
    creatures: string[];
    id: number;
  }
  let results: Result[] = [];

  beforeUpdate(() => {
    const creatures = generateCreatures();
    if (creatures.length === 0) {
      disableCastButton = true;
    } else {
      disableCastButton = false;
    }
  });

  function cast() {
    const newCreatures = generateCreatures();
    results = [{ creatures: newCreatures, id: results.length }, ...results];
  }

  function generateCreatures(): string[] {
    let spell: ({}) => Creature[];
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
  <div transition:fade={{ duration: 400 }}>
    <Alert
      mainText="That's a nat 1."
      secondaryText="Your current options will not generate any creatures! Maybe try adding more sourcebooks?" />
  </div>
{/if}
<div class="flex justify-center m-4">
  <CastButton handleClick={cast} disabled={disableCastButton} />
</div>
<div class="flex flex-col justify-center items-center text-center">
  {#each results as result (result.id)}
    <div
      in:receive={{ key: result.id }}
      out:send={{ key: result.id }}
      animate:flip={{ duration: 200 }}>
      <ResultBox>
        <ul>
          {#each result.creatures as creature}
            <li>{creature}</li>
          {/each}
        </ul>
      </ResultBox>
    </div>
  {/each}
</div>
