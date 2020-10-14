import { render, fireEvent } from "@testing-library/svelte";

import ResponsiveApp from "../src/ResponsiveApp.svelte";

describe("the ResponsiveApp component, rendered in viewports up to 1024 px wide", () => {
  it("contains a button labelled Cast Spell", () => {
    const { getByRole } = render(ResponsiveApp, {
      props: { containerWidth: 800 },
    });
    const button = getByRole("button", { name: "Cast Conjure Animals" });

    expect(button).toBeInTheDocument();
  });

  it("after the user clicks the Cast button, a new result appears", async () => {
    const { getByRole } = render(ResponsiveApp, {
      props: { containerWidth: 800 },
    });

    const castButton = getByRole("button", { name: "Cast Conjure Animals" });

    expect(() => getByRole("list")).toThrow();
    await fireEvent.click(castButton);
    expect(getByRole("list")).toBeInTheDocument();
  });

  it("if the user selects no sourcebooks, then the cast button will be disabled, an error will render, and clicking cast will not generate a result", async () => {
    // the reason that I am getting the cast button every time I need it
    // is because it is rendered conditionally; grabbing it once at the start
    // will mean that it may be stale when we try to test it
    const { getByRole, getAllByRole, getByTestId } = render(ResponsiveApp, {
      props: { containerWidth: 800 },
    });

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
    const { getByTestId, getAllByRole } = render(ResponsiveApp, {
      props: { containerWidth: 800 },
    });

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

describe("the ResponsiveApp component rendered in a viewport >= 1024 px wide", () => {
  it("has an About button, which opens a sidebar", async () => {
    const { getByRole } = render(ResponsiveApp, {
      props: { containerWidth: 1024 },
    });

    expect(getByRole("button", { name: "About" })).toBeInTheDocument();

    expect(getByRole("complementary")).not.toHaveClass("open");
    await fireEvent.click(getByRole("button", { name: "About" }));
    expect(getByRole("complementary")).toHaveClass("open");
  });

  it("closes the About sidebar if the user clicks anywhere in the main app", async () => {
    const { getByRole } = render(ResponsiveApp, {
      props: { containerWidth: 1024 },
    });

    await fireEvent.click(getByRole("button", { name: "About" }));
    expect(getByRole("complementary")).toHaveClass("open");

    await fireEvent.click(getByRole("heading", { name: "Sourcebooks" }));
    expect(getByRole("complementary")).not.toHaveClass("open");
  });
});
