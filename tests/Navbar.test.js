import { render } from "@testing-library/svelte";
import html from "svelte-htm";
import Navbar from "../src/components/Navbar.svelte";

describe("the Navbar component", () => {
  it("renders with a given heading", () => {
    const { getByRole } = render(Navbar, { heading: "test" });

    expect(getByRole("heading", { name: "test" })).toBeInTheDocument();
  });

  it("supports named slotted content", () => {
    const { getByRole, getByText } = render(html`
      $<${Navbar} heading="head">
        <h1 slot="left">Test Header</h1>
        <p slot="right">Test Paragraph</p>
      <//>
    `);
    const testHeading = getByRole("heading", { name: "Test Header" });
    const paragraph = getByText("Test Paragraph");

    expect(testHeading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });
});
