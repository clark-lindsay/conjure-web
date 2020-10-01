import { writeSpellParameters } from "../src/stores/writeSpellParameters";

test("the store has default values when it is created", () => {
  let current = undefined;
  writeSpellParameters.subscribe((val) => {
    current = val;
  });
  expect(current.spellName).toEqual("Conjure Animals");
  expect(current.challengeRating).toEqual(1);
  expect(current.terrains).toEqual(["Land"]);
});

