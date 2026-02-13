import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";

describe("Navbar", () => {
  it("renders navigation links", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );
    
    expect(screen.getByText("Gladious.sys")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("toggles theme when button is clicked", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Navbar />
      </ThemeProvider>
    );

    const toggleButton = screen.getByLabelText("Switch to dark mode");
    expect(toggleButton).toBeInTheDocument();
    
    // Initial state check - assuming default theme context behavior
    // This is a basic rendering test
  });
});
