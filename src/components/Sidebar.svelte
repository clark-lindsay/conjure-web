<script lang="ts">
  export let open: boolean = false;
  export let title: string = "";
  export let left: boolean = true;
  $: right = !left;
</script>

<style>
  .right {
    right: -100%;
    transition: right 0.3s ease-in-out;
  }

  .left {
    left: -100%;
    transition: left 0.3s ease-in-out;
  }

  .open.left {
    left: 0;
  }

  .open.right {
    right: 0;
  }
</style>

<aside
  class="fixed w-full h-full bg-gray-200 border-r-2 shadow-lg"
  class:open
  class:right
  class:left>
  {#if title}
    <h2>{title}</h2>
  {/if}
  <slot />
</aside>
