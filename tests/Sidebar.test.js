import { render } from "@testing-library/svelte";

import Sidebar from "../src/components/Sidebar.svelte";

test("renders with no header if there is no title prop provided", () => {
  const { getByRole } = render(Sidebar);

  expect(() => getByRole("heading")).toThrow();
});

test("renders with a heading with the title of the sidebar content", () => {
  const { getByRole } = render(Sidebar, {
    props: { title: "Spell Attributes" },
  });
  const heading = getByRole("heading");

  expect(heading).toHaveTextContent("Spell Attributes");
});

test("if it is rendered with its open prop set to true, it has a css class named open", async () => {
  const { getByRole, component } = render(Sidebar, { props: { open: true } });
  const aside = getByRole("complementary");

  expect(aside).toHaveClass("open");

  await component.$set({ open: false });
  expect(aside).not.toHaveClass("open");
});

test("renders with a left class on its complementary by default, and without it when the left prop is set to false", async () => {
  const { getByRole, component } = render(Sidebar, { props: { open: true } });
  const aside = getByRole("complementary");

  expect(aside).toHaveClass("left");

  await component.$set({ left: false });
  expect(aside).not.toHaveClass("left");
});
