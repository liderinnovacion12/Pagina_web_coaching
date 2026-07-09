import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renderiza el wordmark, el selector de idioma y el link de ingreso", () => {
    render(<SiteHeader />);

    expect(screen.getByTestId("site-header")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /team 100%.*real estate/i })
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Ingresar" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
