<script lang="ts">
  import { sources } from "conjure5e";

  export let heading: string = "Sourcebooks";

  let sourceBookTitles = Object.values(sources).sort();
  let selectedSources: string[] = [
    sources.BR,
    sources.MM,
    sources.PHB,
    sources.DMG,
  ];
</script>

<h2>{heading}</h2>

<form name="sourcebooks" id="select-sourcebooks">
  {#each sourceBookTitles as sourcebook}
    <label>
      <input type="checkbox" value={sourcebook} bind:group={selectedSources} />
      {sourcebook}
    </label>
  {/each}
</form>
