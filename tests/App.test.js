import { render, fireEvent } from "@testing-library/svelte";

import App from "../src/App.svelte";

describe("the App component", () => {
  it("contains a button labelled Cast Spell", () => {
    const { getByRole } = render(App);
    const button = getByRole("button", { name: "Cast Conjure Animals" });

    expect(button).toBeInTheDocument();
  });

  it("after the user clicks the Cast button, a new result appears", async () => {
    const { getByRole } = render(App);
    const castButton = getByRole("button", { name: "Cast Conjure Animals" });

    expect(() => getByRole("list")).toThrow();
    await fireEvent.click(castButton);
    expect(getByRole("list")).toBeInTheDocument();
  });

  it("if the user selects no sourcebooks, then the cast button will be disabled, an error will render, and clicking cast will not generate a result", async () => {
    // the reason that I am getting the cast button every time I need it
    // is because it is rendered conditionally; grabbing it once at the start
    // will mean that it may be stale when we try to test it
    const { getByRole, getAllByRole, getByTestId } = render(App);

    const sourceButton = getByTestId("sourceOptionsMenuDiv");

    expect(
      getByRole("button", { name: "Cast Conjure Animals" })
    ).not.toHaveClass("cursor-not-allowed");

    await fireEvent.click(sourceButton);
    const checkedBoxes = getAllByRole("checkbox", { checked: true });
    for (const box of checkedBoxes) {
      await fireEvent.click(box);
    }
    await fireEvent.click(sourceButton);

    expect(getByRole("button", { name: "Cast Conjure Animals" })).toHaveClass(
      "cursor-not-allowed"
    );
    expect(getByRole("alert")).toBeInTheDocument();

    await fireEvent.click(
      getByRole("button", { name: "Cast Conjure Animals" })
    );

    expect(() => getByRole("list")).toThrow();
  });

  it("opening either of the sidebar menus toggles the presence of the overflow-hidden and h-full classes on the body div", async () => {
    const { getByTestId, getAllByRole } = render(App);
    const sourceButton = getAllByRole("button", { name: "" })[1];
    const spellParametersButton = getAllByRole("button", { name: "" })[0];

    expect(getByTestId("body-div")).not.toHaveClass(
      "overflow-hidden",
      "h-full"
    );
    await fireEvent.click(sourceButton);
    expect(getByTestId("body-div")).toHaveClass("overflow-hidden", "h-full");
    await fireEvent.click(sourceButton);
    expect(getByTestId("body-div")).not.toHaveClass(
      "overflow-hidden",
      "h-full"
    );

    await fireEvent.click(spellParametersButton);
    expect(getByTestId("body-div")).toHaveClass("overflow-hidden", "h-full");
    await fireEvent.click(spellParametersButton);
    expect(getByTestId("body-div")).not.toHaveClass(
      "overflow-hidden",
      "h-full"
    );
  });
});
