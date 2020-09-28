import { derived } from "svelte/store";
import { writeSpellParameters } from "./writeSpellParameters";

export const readSpellParameters = derived(
  writeSpellParameters,
  ($writeSpellParameters) => $writeSpellParameters
);
