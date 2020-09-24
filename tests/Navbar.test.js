import { render, fireEvent, getAllByRole } from "@testing-library/svelte";

import Navbar from "../src/components/Navbar.svelte";

test("renders with the app title, and two buttons", () => {
  const { getByText, getAllByRole } = render(Navbar);

  const navbar = getByText("Conjure5e");
  const buttons = getAllByRole("button");

  expect(navbar).toBeInTheDocument();
  expect(buttons).toHaveLength(2);
});
