import { render } from "@testing-library/svelte";
import html from "svelte-htm";

import ResultBox from "../src/components/ResultBox.svelte";

test("supports slotted content", () => {
  const { getByRole, getByText } = render(html`
    $<${ResultBox}>
      <h1>Test Header</h1>
      <p>Test Paragraph</p>
    <//>
  `);
  const heading = getByRole("heading");
  const paragraph = getByText("Test Paragraph");

  expect(heading).toBeInTheDocument();
  expect(paragraph).toBeInTheDocument();
});
