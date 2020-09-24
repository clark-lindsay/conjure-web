<script lang="ts">
  export let open: boolean = false;
  export let title: string = "";
</script>

<style>
  aside {
    left: -100%;
    transition: left 0.3s ease-in-out;
  }

  .open {
    left: 0;
  }
</style>

<aside
  class="absolute w-full h-full bg-gray-200 border-r-2 shadow-lg"
  class:open>
  {#if title}
    <h2>{title}</h2>
  {/if}
</aside>
