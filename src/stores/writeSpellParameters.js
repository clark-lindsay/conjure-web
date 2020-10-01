import { writable } from "svelte/store";

const defaultStore = {
  spellName: "Conjure Animals",
  challengeRating: 1,
  terrains: ["Land"],
};
export const writeSpellParameters = writable({ ...defaultStore });
