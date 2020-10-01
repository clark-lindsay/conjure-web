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

test("if the user selects no sourcebooks, then the cast button will be disabled, an error will render, and clicking cast will not generate a result", async () => {
  // the reason that I am getting the cast button every time I need it
  // is because it is rendered conditionally; grabbing it once at the start
  // will mean that it may be stale when we try to test it
  const { getByRole, getAllByRole, getByTestId } = render(App);

  const sourceButton = getByTestId("sourceOptionsMenuDiv");

  expect(getByRole("button", { name: "Cast Spell" })).not.toHaveClass(
    "cursor-not-allowed"
  );

  await fireEvent.click(sourceButton);
  const checkedBoxes = getAllByRole("checkbox", { checked: true });
  for (const box of checkedBoxes) {
    await fireEvent.click(box);
  }
  await fireEvent.click(sourceButton);

  expect(getByRole("button", { name: "Cast Spell" })).toHaveClass(
    "cursor-not-allowed"
  );
  expect(getByRole("alert")).toBeInTheDocument();

  await fireEvent.click(getByRole("button", { name: "Cast Spell" }));

  expect(() => getByRole("list")).toThrow();
});

