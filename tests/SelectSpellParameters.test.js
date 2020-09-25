import { render } from "@testing-library/svelte";

import SelectSpellParameters from "../src/components/SelectSpellParameters.svelte";

test("renders with the heading provided, or by default with Spell Parameters", async () => {
  const { getByRole, component } = render(SelectSpellParameters);
  const heading = getByRole("heading");

  expect(heading).toHaveTextContent("Spell Parameters");

  await component.$set({ heading: "alternate" });
  expect(heading).toHaveTextContent("alternate");
});

test("it renders with an accessible form", () => {
  const { getByRole } = render(SelectSpellParameters);
  const form = getByRole("form");

  expect(form).toBeInTheDocument();
});

test("it renders with two select elements", () => {
  const { getAllByRole } = render(SelectSpellParameters);
  const selects = getAllByRole("combobox");

  expect(selects).toHaveLength(2);
});

test("the default is conjure animals, with a CR of 1", () => {
  const { getByRole } = render(SelectSpellParameters);
  const form = getByRole("form");

  expect(form).toHaveFormValues({
    spell: "Conjure Animals",
    "challenge-rating": "1",
  });
});

test("it contains three checkboxes, and the one labelled Land is checked", () => {
  const { getAllByRole, getByLabelText } = render(SelectSpellParameters);
  const checkboxes = getAllByRole("checkbox");
  const landCheckbox = getByLabelText("Land");

  expect(checkboxes).toHaveLength(3);
  expect(landCheckbox).toBeChecked();
});
