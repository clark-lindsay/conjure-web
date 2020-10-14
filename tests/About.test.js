import { render } from "@testing-library/svelte";
import About from "../src/components/About.svelte";

describe("the About component", () => {
  it("renders", () => {
    const { getByRole } = render(About);

    expect(getByRole("heading")).toHaveTextContent("About");
  });
});
