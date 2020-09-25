import { render } from "@testing-library/svelte";

import SelectSourcebooks from "../src/components/SelectSourcebooks.svelte";

test("renders with a default heading of Sourcebooks, or with an alternate heading if one is provided", async () => {
  const { getByRole, component } = render(SelectSourcebooks);
  const heading = getByRole("heading");

  expect(heading).toHaveTextContent("Sourcebooks");

  await component.$set({ heading: "alternate" });
  expect(heading).toHaveTextContent("alternate");
});

test("contains a form, with 18 options, one for each sourcebook covered by the conjure5e package", () => {
  const { getByRole, getAllByRole } = render(SelectSourcebooks);
  const form = getByRole("form");
  const checkboxes = getAllByRole("checkbox");

  expect(checkboxes).toHaveLength(18);
  for (const checkbox of checkboxes) {
    expect(form).toContainElement(checkbox);
  }
});

test("the core rulebooks are selected by default", () => {
  const { getByLabelText } = render(SelectSourcebooks);

  expect(getByLabelText("Player's Handbook")).toBeChecked();
  expect(getByLabelText("Basic Rules")).toBeChecked();
  expect(getByLabelText("Dungeon Master's Guide")).toBeChecked();
  expect(getByLabelText("Monster Manual")).toBeChecked();
});
