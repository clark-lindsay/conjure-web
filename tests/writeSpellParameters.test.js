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

test("the setSpellName function can change the name of the spell", () => {
  let current = undefined;
  writeSpellParameters.subscribe((val) => {
    current = val;
  });
  expect(current.spellName).toEqual("Conjure Animals");
  writeSpellParameters.setSpellName("Conjure Woodland Beings");
  expect(current.spellName).toEqual("Conjure Woodland Beings");
});

test("the setChallengeRating function can change the challenge rating property", () => {
  let current = undefined;
  writeSpellParameters.subscribe((val) => {
    current = val;
  });
  expect(current.challengeRating).toEqual(1);
  writeSpellParameters.setChallengeRating(2);
  expect(current.challengeRating).toEqual(2);
});

test("the setTerrains function can change the terrains property of the store", () => {
  let current = undefined;
  writeSpellParameters.subscribe((val) => {
    current = val;
  });
  expect(current.terrains).toEqual(["Land"]);
  writeSpellParameters.setTerrains(["Land", "Water"]);
  expect(current.terrains).toEqual(["Land", "Water"]);
});

test("the reset function will set the store back to its default properties", () => {
  let current = undefined;
  writeSpellParameters.subscribe((val) => {
    current = val;
  });

  writeSpellParameters.setTerrains(["Land", "Water"]);
  writeSpellParameters.setChallengeRating(2);
  writeSpellParameters.setSpellName("Conjure Woodland Beings");

  expect(current.spellName).not.toEqual("Conjure Animals");
  expect(current.challengeRating).not.toEqual(1);
  expect(current.terrains).not.toEqual(["Land"]);
  writeSpellParameters.reset();
  expect(current.spellName).toEqual("Conjure Animals");
  expect(current.challengeRating).toEqual(1);
  expect(current.terrains).toEqual(["Land"]);
});
