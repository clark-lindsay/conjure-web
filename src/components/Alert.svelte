<script lang="ts">
  export let mainText: string = "";
  export let secondaryText: string = "";
</script>

<div
  class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded
    relative"
  role="alert">
  <strong class="font-bold">{mainText}</strong>
  <span class="block sm:inline">{secondaryText}</span>
</div>
