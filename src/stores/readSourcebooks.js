import { derived } from "svelte/store";
import { writeSourcebooks } from "./writeSourcebooks";

export const readSourcebooks = derived(
  writeSourcebooks,
  ($writeSourcebooks) => $writeSourcebooks
);
