import { render, fireEvent } from "@testing-library/svelte";

import SelectSpellParameters from "../src/components/SelectSpellParameters.svelte";

describe("the SelectSpellParameters component", () => {
  it("renders with the heading provided, or by default with Spell Parameters", async () => {
    const { getByRole, component } = render(SelectSpellParameters);
    const heading = getByRole("heading", { name: "Spell Parameters" });

    expect(heading).toHaveTextContent("Spell Parameters");

    await component.$set({ heading: "alternate" });
    expect(heading).toHaveTextContent("alternate");
  });

  it("renders with an accessible form", () => {
    const { getByRole } = render(SelectSpellParameters);
    const form = getByRole("form");

    expect(form).toBeInTheDocument();
  });

  it("renders with two select elements", () => {
    const { getAllByRole } = render(SelectSpellParameters);
    const selects = getAllByRole("combobox");

    expect(selects).toHaveLength(2);
  });

  it("the default is conjure animals, with a CR of 1", () => {
    const { getByRole } = render(SelectSpellParameters);
    const form = getByRole("form");

    expect(form).toHaveFormValues({
      spell: "Conjure Animals",
      "challenge-rating": "1",
    });
  });

  it("contains three checkboxes, and the one labelled Land is checked", () => {
    const { getAllByRole, getByLabelText } = render(SelectSpellParameters);
    const checkboxes = getAllByRole("checkbox");
    const landCheckbox = getByLabelText("Land");

    expect(checkboxes).toHaveLength(3);
    expect(landCheckbox).toBeChecked();
  });

  it("does not show challenge rating options that would result in having no creatures generated", async () => {
    const { getByRole, getByLabelText } = render(SelectSpellParameters);
    const challengeRatingSelect = getByRole("combobox", {
      name: "Challenge Rating of Creatures",
    });
    const landCheckbox = getByLabelText("Land");

    expect(challengeRatingSelect).toContainHTML('<option value="1">1</option>');
    await fireEvent.click(landCheckbox);
    expect(challengeRatingSelect).not.toContainHTML(
      '<option value="1">1</option>'
    );
    await fireEvent.click(landCheckbox);
    await fireEvent.change(getByRole("combobox", { name: "Spell" }), {
      target: { value: "Conjure Minor Elementals" },
    });
    expect(challengeRatingSelect).not.toContainHTML(
      '<option value="0.125">0.125</option>'
    );
  });
});
