import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicTemplate from "./template";

vi.mock("next/navigation", () => ({
  usePathname: () => "/login",
}));

describe("PublicTemplate", () => {
  it("renderiza sus hijos", () => {
    render(
      <PublicTemplate>
        <p>Contenido</p>
      </PublicTemplate>
    );
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
