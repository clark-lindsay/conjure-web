import { render } from "@testing-library/svelte";

import App from "../src/App.svelte";

test("shows proper heading when rendered", () => {
  const { getByText } = render(App);

  expect(getByText("Conjure5e")).toBeInTheDocument();
});

test("contains a button labelled Cast Spell", () => {
  const { getByText } = render(App);
  const button = getByText("Cast Spell");

  expect(button).toBeInTheDocument();
});
