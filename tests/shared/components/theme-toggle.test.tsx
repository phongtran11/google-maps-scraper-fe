import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "~/shared/components/theme-toggle";

const mockToggleTheme = vi.fn();
let mockTheme: "light" | "dark" = "light";

vi.mock("~/shared/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockToggleTheme.mockClear();
    mockTheme = "light";
  });

  it("renders a toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows dark mode aria-label when in light mode", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Chuyển sang chế độ tối" }),
    ).toBeInTheDocument();
  });

  it("shows light mode aria-label when in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Chuyển sang chế độ sáng" }),
    ).toBeInTheDocument();
  });

  it("calls toggleTheme on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button"));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("has the correct aria-label based on theme", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Chuyển sang chế độ tối");
  });

  it("uses ghost variant and icon size", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");
    expect(button.className).toContain("w-10");
  });
});
