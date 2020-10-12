<script lang="ts">
  import HamburgerButton from "./HamburgerButton.svelte";
  import Navbar from "./Navbar.svelte";

  export let heading: string;
  export let spellOptionsMenu: boolean = false;
  export let sourceOptionsMenu: boolean = false;
</script>

<Navbar {heading}>
  <div
    class={sourceOptionsMenu ? 'invisible' : ''}
    slot="left"
    data-testid="spellOptionsMenuDiv">
    <HamburgerButton bind:open={spellOptionsMenu} />
  </div>
  <div
    class={spellOptionsMenu ? 'invisible' : ''}
    slot="right"
    data-testid="sourceOptionsMenuDiv">
    <HamburgerButton bind:open={sourceOptionsMenu} left={false} />
  </div>
</Navbar>
