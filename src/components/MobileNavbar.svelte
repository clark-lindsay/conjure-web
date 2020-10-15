<script lang="ts">
  import HamburgerButton from "./HamburgerButton.svelte";
  import Navbar from "./Navbar.svelte";

  export let heading: string;
  export let spellOptionsMenu: boolean = false;
  export let about: boolean = false;
</script>

<Navbar {heading}>
  <div
    class={about ? 'invisible' : ''}
    slot="left"
    data-testid="spellOptionsMenuDiv">
    <HamburgerButton bind:open={spellOptionsMenu} />
  </div>
  <div
    class={spellOptionsMenu ? 'invisible' : ''}
    slot="right"
    data-testid="aboutDiv">
    <button
      on:click={() => (about = !about)}
      class="text-blue-700 hover:{about ? 'text-red-700' : 'text-blue-900'} hover:bg-gray-100
        text-xl p-2">
      {about ? 'Close Sidebar' : 'About'}
    </button>
  </div>
</Navbar>
