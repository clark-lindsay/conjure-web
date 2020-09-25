<script lang="ts">
  import { writeSourcebooks } from "../stores/writeSourcebooks";
  import { sources } from "conjure5e";

  export let heading: string = "Sourcebooks";

  let sourceBookTitles = Object.values(sources).sort();
</script>

<h2>{heading}</h2>

<form name="sourcebooks" id="select-sourcebooks">
  {#each sourceBookTitles as sourcebook}
    <label>
      <input
        type="checkbox"
        value={sourcebook}
        bind:group={$writeSourcebooks} />
      {sourcebook}
    </label>
  {/each}
</form>
