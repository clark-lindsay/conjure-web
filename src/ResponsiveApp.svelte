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
  import MobileNavbar from "./components/MobileNavbar.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import SelectSpellParameters from "./components/SelectSpellParameters.svelte";
  import SelectSourcebooks from "./components/SelectSourcebooks.svelte";
  import ResultBox from "./components/ResultBox.svelte";
  import CastButton from "./components/CastButton.svelte";
  import Alert from "./components/Alert.svelte";
  import About from "./components/About.svelte";

  export let containerWidth: number;

  let leftSidebarIsOpen: boolean = false;
  let rightSidebarIsOpen: boolean = false;
  const appVersion: string = packageVersion();
  const disabledAlertMainText = "That's a nat 1.";
  const disabledAlertSecondaryText =
    "Your current options will not generate any creatures! Maybe try adding more sourcebooks?";
  let disableCastButton: boolean = false;
  interface Result {
    creatures: string[];
    spellName: string;
    challengeRating: number;
    terrains: string[];
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
    results = [
      {
        creatures: newCreatures,
        spellName: $readSpellParameters.spellName,
        challengeRating: $readSpellParameters.challengeRating,
        terrains: $readSpellParameters.terrains,
        id: results.length,
      },
      ...results,
    ];
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

<div
  class="{leftSidebarIsOpen || rightSidebarIsOpen ? 'overflow-hidden h-full' : ''}
    w-full"
  data-testid="body-div">
  {#if containerWidth < 1024}
    <MobileNavbar
      heading="Conjure5e{appVersion ? ` ${appVersion}` : ''}"
      bind:spellOptionsMenu={leftSidebarIsOpen}
      bind:about={rightSidebarIsOpen} />
    <Sidebar bind:open={leftSidebarIsOpen}>
      <SelectSpellParameters />
      <SelectSourcebooks />
    </Sidebar>
    <Sidebar bind:open={rightSidebarIsOpen} left={false}>
      <About />
    </Sidebar>

    {#if disableCastButton}
      <div transition:fade={{ duration: 400 }}>
        <Alert
          mainText={disabledAlertMainText}
          secondaryText={disabledAlertSecondaryText} />
      </div>
    {/if}
    <div class="flex justify-center m-4">
      <CastButton
        name={`Cast ${$readSpellParameters.spellName}`}
        handleClick={cast}
        disabled={disableCastButton} />
    </div>
    <div class="flex flex-col justify-center items-center text-center">
      {#each results as result (result.id)}
        <div
          in:receive={{ key: result.id }}
          out:send={{ key: result.id }}
          animate:flip={{ duration: 200 }}>
          <ResultBox
            heading={result.spellName}
            challengeRating={result.challengeRating}
            terrains={result.terrains}>
            <ul>
              {#each result.creatures as creature}
                <li>{creature}</li>
              {/each}
            </ul>
          </ResultBox>
        </div>
      {/each}
    </div>
  {:else}
    <Navbar heading="Conjure5e{appVersion ? ` ${appVersion}` : ''}">
      <button
        on:click={() => (rightSidebarIsOpen = !rightSidebarIsOpen)}
        slot="right"
        class="text-blue-700 hover:{rightSidebarIsOpen ? 'text-red-700' : 'text-blue-900'}
          hover:bg-gray-100 text-xl p-2">
        {rightSidebarIsOpen ? 'Close Sidebar' : 'About'}
      </button>
    </Navbar>

    <Sidebar halfScreen={true} bind:open={rightSidebarIsOpen} left={false}>
      <About />
    </Sidebar>

    <div
      class="flex overflow-hidden h-full"
      on:click={() => {
        rightSidebarIsOpen = false;
      }}>
      <div class="flex w-1/2 mr-2">
        <SelectSourcebooks />
        <div>
          <SelectSpellParameters />
          {#if disableCastButton}
            <div transition:fade={{ duration: 200 }}>
              <Alert
                mainText={disabledAlertMainText}
                secondaryText={disabledAlertSecondaryText} />
            </div>
          {/if}
          <div class="justify-center m-4">
            <CastButton
              name={`Cast ${$readSpellParameters.spellName}`}
              handleClick={cast}
              disabled={disableCastButton} />
          </div>
        </div>
      </div>
      <div
        class="flex flex-wrap w-1/2 content-start overflow-y-auto max-h-screen">
        {#each results as result (result.id)}
          <div
            class="m-1"
            in:receive={{ key: result.id }}
            out:send={{ key: result.id }}
            animate:flip={{ duration: 400 }}>
            <ResultBox
              heading={result.spellName}
              challengeRating={result.challengeRating}
              terrains={result.terrains}>
              <ul>
                {#each result.creatures as creature}
                  <li>{creature}</li>
                {/each}
              </ul>
            </ResultBox>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
