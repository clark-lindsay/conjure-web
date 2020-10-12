<script lang="ts">
  import ResponsiveApp from "./ResponsiveApp.svelte";

  let offsetWidth: number;
  $: realContainerWidth = offsetWidth + 16;
</script>

<div class="w-full p-0 m-0" bind:offsetWidth>
  <ResponsiveApp containerWidth={realContainerWidth} />
</div>
