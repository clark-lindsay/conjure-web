import { render, fireEvent } from "@testing-library/svelte";

import Navbar from "../src/components/Navbar.svelte";

test("renders with the app title, and two buttons", () => {
  const { getByText, getAllByRole } = render(Navbar);

  const navbar = getByText("Conjure5e");
  const buttons = getAllByRole("button");

  expect(navbar).toBeInTheDocument();
  expect(buttons).toHaveLength(2);
});

test("when one button is clicked, the other button becomes invisible", async () => {
  const { getAllByRole, getByTestId } = render(Navbar);
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
