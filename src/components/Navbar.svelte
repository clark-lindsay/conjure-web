<script>
  import HamburgerButton from "./HamburgerButton.svelte";

  export let spellOptionsMenu = false;
  export let sourceOptionsMenu = false;
</script>

<header
  class="flex justify-between bg-gray-200 p-2 items-center text-gray-600
    border-b-2">
  <nav class="flex justify-between w-full">
    <div
      class={sourceOptionsMenu ? 'invisible' : ''}
      data-testid="spellOptionsMenuDiv">
      <HamburgerButton bind:open={spellOptionsMenu} />
    </div>
    <h1 class="text-blue-700 text-3xl">Conjure5e</h1>
    <div
      class={spellOptionsMenu ? 'invisible' : ''}
      data-testid="sourceOptionsMenuDiv">
      <HamburgerButton bind:open={sourceOptionsMenu} left={false} />
    </div>
  </nav>
</header>
