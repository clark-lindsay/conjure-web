import { render, fireEvent } from "@testing-library/svelte";

import App from "../src/App.svelte";

test("contains a button labelled Cast Spell", () => {
  const { getByText } = render(App);
  const button = getByText("Cast Spell");

  expect(button).toBeInTheDocument();
});

test("after the user clicks the Cast button, a new result appears", async () => {
  const { getByRole } = render(App);
  const castButton = getByRole("button", { name: "Cast Spell" });

  expect(() => getByRole("list")).toThrow();
  await fireEvent.click(castButton);
  expect(getByRole("list")).toBeInTheDocument();
});
