<script lang="ts">
  import { readSourcebooks } from "./stores/readSourcebooks";
  import { readSpellParameters } from "./stores/readSpellParameters";

  import Navbar from "./components/Navbar.svelte";
  import Sidebar from "./components/Sidebar.svelte";

  export let leftSidebarIsOpen: boolean = false;
  export let rightSidebarIsOpen: boolean = false;
</script>

<svelte:head>
  <link
    href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
    rel="stylesheet" />
</svelte:head>

<Navbar
  bind:spellOptionsMenu={leftSidebarIsOpen}
  bind:sourceOptionsMenu={rightSidebarIsOpen} />
<Sidebar bind:open={leftSidebarIsOpen} />
<Sidebar bind:open={rightSidebarIsOpen} left={false} />

<button name="cast-spell" id="cast-spell-button">Cast Spell</button>
