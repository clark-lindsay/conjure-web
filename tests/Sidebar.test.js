import { render } from "@testing-library/svelte";
import html from "svelte-htm";

import Sidebar from "../src/components/Sidebar.svelte";

// If your intellisense complains about using "await" to call "component.$set",
// it is probably wrong. Feel free to remove the "await" as a test, but this
// will result in previously passing tests to fail.

describe("the Sidebar component", () => {
  it("renders with no header if there is no title prop provided", () => {
    const { getByRole } = render(Sidebar);

    expect(() => getByRole("heading")).toThrow();
  });

  it("renders with a heading with the title of the sidebar content", () => {
    const { getByRole } = render(Sidebar, {
      props: { title: "Spell Attributes" },
    });
    const heading = getByRole("heading");

    expect(heading).toHaveTextContent("Spell Attributes");
  });

  it("if it is rendered with its open prop set to true, it has a css class named open", async () => {
    const { getByRole, component } = render(Sidebar, { props: { open: true } });
    const aside = getByRole("complementary");

    expect(aside).toHaveClass("open");

    await component.$set({ open: false });
    expect(aside).not.toHaveClass("open");
  });

  it("renders with a left class on its complementary by default, and without it when the left prop is set to false", async () => {
    const { getByRole, component } = render(Sidebar, { props: { open: true } });
    const aside = getByRole("complementary");

    expect(aside).toHaveClass("left");

    await component.$set({ left: false });
    expect(aside).not.toHaveClass("left");
  });

  it("supports slotted content", () => {
    const { getByRole } = render(html`
      <${Sidebar}>
        <h1>Test Data</h1>
      <//>
    `);
    const heading = getByRole("heading");

    expect(heading).toBeInTheDocument();
  });

  it("will have a class w-1/2 if the halfScreen prop is passed as true", () => {
    const { getByRole } = render(Sidebar, { props: { halfScreen: true } });

    expect(getByRole("complementary")).toHaveClass("w-1/2");
  });
});
