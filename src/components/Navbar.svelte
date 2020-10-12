<script lang="ts">
  export let heading: string;
</script>

<header
  class="flex justify-between bg-gray-200 p-2 items-center text-gray-600
    border-b-2">
  <nav class="flex justify-between w-full">
    <slot name="left" />
    <h1 class="text-blue-700 text-3xl">{heading}</h1>
    <slot name="right" />
  </nav>
</header>
