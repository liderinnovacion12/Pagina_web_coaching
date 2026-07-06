import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "./page";

describe("LandingPage smoke test", () => {
  it("renders the Coachpro heading", () => {
    render(<LandingPage />);
    expect(screen.getByText("Coachpro")).toBeInTheDocument();
  });
});
