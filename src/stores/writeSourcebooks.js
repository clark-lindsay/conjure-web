import { sources } from "conjure5e";
import { writable } from "svelte/store";

export const writeSourcebooks = writable([
  sources.BR,
  sources.MM,
  sources.PHB,
  sources.DMG,
]);
