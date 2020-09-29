import { render, fireEvent } from "@testing-library/svelte";

import Navbar from "../src/components/Navbar.svelte";

test("renders with the supplied heading, and two buttons", () => {
  const { getByRole, getAllByRole } = render(Navbar, { heading: "Conjure5e" });

  const heading = getByRole("heading", { name: "Conjure5e" });
  const buttons = getAllByRole("button");

  expect(heading).toBeInTheDocument();
  expect(buttons).toHaveLength(2);
});

test("when one button is clicked, the other button becomes invisible", async () => {
  const { getAllByRole, getByTestId } = render(Navbar, { heading: "test" });
  const spellOptionsButton = getAllByRole("button")[0];
  const sourceOptionsButton = getAllByRole("button")[1];

  expect(getByTestId("sourceOptionsMenuDiv")).not.toHaveClass("invisible");
  await fireEvent.click(spellOptionsButton);
  expect(getByTestId("sourceOptionsMenuDiv")).toHaveClass("invisible");
  await fireEvent.click(spellOptionsButton);
  expect(getByTestId("sourceOptionsMenuDiv")).not.toHaveClass("invisible");

  expect(getByTestId("spellOptionsMenuDiv")).not.toHaveClass("invisible");
  await fireEvent.click(sourceOptionsButton);
  expect(getByTestId("spellOptionsMenuDiv")).toHaveClass("invisible");
  await fireEvent.click(sourceOptionsButton);
  expect(getByTestId("spellOptionsMenuDiv")).not.toHaveClass("invisible");
});
