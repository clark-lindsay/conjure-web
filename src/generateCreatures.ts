import type { Creature } from "conjure5e/dist/src/Creature";
import {
  conjureAnimals,
  conjureMinorElementals,
  conjureWoodlandBeings,
} from "conjure5e";
import { readSpellParameters } from "./stores/readSpellParameters.js";

export function generateCreatures(): string[] {
  let spell: ({}) => Creature[];
  if ($readSpellParameters.spellName === "Conjure Animals") {
    spell = conjureAnimals;
  } else if ($readSpellParameters.spellName === "Conjure Woodland Beings") {
    spell = conjureWoodlandBeings;
  } else {
    spell = conjureMinorElementals;
  }
  const { terrains, challengeRating } = $readSpellParameters;
  const sources = $readSourcebooks;
  return spell({
    terrains,
    challengeRating,
    sources,
  }).map((creature) => creature.name);
}
