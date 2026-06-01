import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "~/shared/components/atoms/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with defaultValue", () => {
    render(<Input defaultValue="Giá trị" />);
    expect(screen.getByDisplayValue("Giá trị")).toBeInTheDocument();
  });

  it("applies default variant and size", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border");
    expect(input.className).toContain("h-10");
  });

  it("renders filled variant", () => {
    render(<Input variant="filled" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("bg-muted");
    expect(input.className).not.toContain("border border-input");
  });

  it("renders all sizes", () => {
    const sizes = ["sm", "md", "lg"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Input inputSize={size} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      unmount();
    }
  });

  it("shows error state with aria-invalid", () => {
    render(<Input error />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("data-error", "true");
    expect(input.className).toContain("border-destructive");
  });

  it("does not have aria-invalid when no error", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("renders prefix icon", () => {
    render(<Input prefixIcon={<span data-testid="prefix">🔍</span>} />);
    expect(screen.getByTestId("prefix")).toBeInTheDocument();
    expect(screen.getByRole("textbox").className).toContain("pl-9");
  });

  it("renders suffix icon", () => {
    render(<Input suffixIcon={<span data-testid="suffix">✓</span>} />);
    expect(screen.getByTestId("suffix")).toBeInTheDocument();
    expect(screen.getByRole("textbox").className).toContain("pr-9");
  });

  it("disables input", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("calls onChange handler", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole("textbox").className).toContain("custom-input");
  });

  it("auto-generates an id", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id");
  });

  it("uses provided id over generated one", () => {
    render(<Input id="my-input" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "my-input");
  });
});
