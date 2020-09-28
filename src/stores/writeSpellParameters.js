import { writable } from "svelte/store";

const defaultStore = {
  spellName: "Conjure Animals",
  challengeRating: 1,
  terrains: ["Land"],
};

function createWriteSpellParameters() {
  const { subscribe, set, update } = writable(defaultStore);

  return {
    subscribe,
    setSpellName: (spell) =>
      update((params) => {
        return { ...params, spellName: spell };
      }),
    setChallengeRating: (cr) =>
      update((params) => {
        return { ...params, challengeRating: cr };
      }),
    setTerrains: (terrains) =>
      update((params) => {
        return { ...params, terrains };
      }),
    reset: () => set(defaultStore),
  };
}

export const writeSpellParameters = createWriteSpellParameters();
