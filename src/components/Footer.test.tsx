import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("renders copyright with current year", () => {
    render(<Footer />);
    expect(screen.getByText(/2026 Montana Howard/)).toBeInTheDocument();
  });

  it("shows operational status", () => {
    render(<Footer />);
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });
});
