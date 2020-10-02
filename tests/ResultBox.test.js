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
  const testHeading = getByRole("heading", { name: "Test Header" });
  const paragraph = getByText("Test Paragraph");

  expect(testHeading).toBeInTheDocument();
  expect(paragraph).toBeInTheDocument();
});

test("accepts a heading, that will be rendered as a semantic heading, with a default of Result", async () => {
  const { getByRole, component } = render(ResultBox);

  expect(getByRole("heading", { name: "Result" })).toBeInTheDocument();

  await component.$set({ heading: "test" });

  expect(getByRole("heading", { name: "test" })).toBeInTheDocument();
});

test("accepts a challenge rating and a terrain list, but only displays something if they are given", async () => {
  const { getByText, component } = render(ResultBox);

  await component.$set({ terrains: ["Land", "Water"] });
  expect(getByText("Land, Water")).toBeInTheDocument();

  await component.$set({ challengeRating: 1, terrains: [] });
  expect(getByText("CR1")).toBeInTheDocument();
  expect(() => getByText("Land, Water")).toThrow();

  await component.$set({ terrains: ["Land", "Water", "Air"] });
  expect(getByText("CR1")).toBeInTheDocument();
  expect(getByText("Land, Water, Air")).toBeInTheDocument();
});
