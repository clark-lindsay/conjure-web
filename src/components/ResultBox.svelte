<script lang="ts">
  export let heading: string = "Result";
  export let challengeRating: number;
  export let terrains: string[] = [];
</script>

<style>
  .box {
    width: 300px;
    border: 1px solid #aaa;
    border-radius: 10px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1em;
    margin: 0 0 1em 0;
  }
</style>

<div class="box">
  <div class="flex-col text-center">
    <h3 class="text-blue-700 text-lg mr-2">{heading}</h3>
    <div class="flex justify-between">
      {#if challengeRating}
        <p class="text-blue-700 mr-2">CR{challengeRating}</p>
      {/if}
      {#if terrains.length !== 0}
        <p class="text-blue-700 mr-2">
          {terrains.toString().split(',').join(', ')}
        </p>
      {/if}
    </div>
  </div>
  <hr />
  <slot />
</div>
