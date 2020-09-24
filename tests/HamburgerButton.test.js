import { render, fireEvent } from "@testing-library/svelte";

import HamburgerButton from "../src/components/HamburgerButton.svelte";

test("renders with the button role", () => {
  const { getByRole } = render(HamburgerButton);
  const button = getByRole("button");

  expect(button).toBeInTheDocument();
});

test("when it is clicked, it toggles the presence of an open css class", async () => {
  const { getByRole } = render(HamburgerButton);
  const button = getByRole("button");

  await fireEvent.click(button);
  expect(button).toHaveClass("open");

  await fireEvent.click(button);
  expect(button).not.toHaveClass("open");
});

test("when it is clicked, it changes between a gray font and a red font", async () => {
  const { getByRole } = render(HamburgerButton);
  const button = getByRole("button");

  expect(button).toHaveClass("text-gray-500");
  await fireEvent.click(button);
  expect(button).toHaveClass("text-red-500");
});

