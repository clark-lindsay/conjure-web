<script>
  import HamburgerButton from "./HamburgerButton.svelte";

  export let sidebar = false;
</script>

<header
  class="flex justify-between bg-gray-200 p-2 items-center text-gray-600
    border-b-2">
  <nav class="flex">
    <HamburgerButton bind:open={sidebar} />
    <h1 class="text-blue-700 text-3xl">Conjure5e</h1>
    <HamburgerButton bind:open={sidebar} />
  </nav>
</header>
