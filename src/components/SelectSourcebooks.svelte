<script lang="ts">
  import { writeSourcebooks } from "../stores/writeSourcebooks";
  import { sources } from "conjure5e";

  export let heading: string = "Sourcebooks";

  let sourceBookTitles = Object.values(sources).sort();
</script>

<div class="block">
  <h2 class="text-blue-700 text-2xl mx-2">{heading}</h2>

  <div class="overflow-visible overflow-auto box-border pb-8 mb-4">
    <form
      name="sourcebooks"
      id="select-sourcebooks"
      class="overflow-visible overflow-auto box-border pb-8">
      {#each sourceBookTitles as sourcebook}
        <label class="text-lg mx-2 my-1">
          <input
            type="checkbox"
            value={sourcebook}
            bind:group={$writeSourcebooks} />
          {sourcebook}
        </label>
      {/each}
    </form>
  </div>
</div>
